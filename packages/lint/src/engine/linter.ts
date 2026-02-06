import { readFile, writeFile } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';
import fg from 'fast-glob';
import { parseSkillFile } from '@skillbolt/core';
import type {
  Rule,
  RuleSeverity,
  LintResult,
  LintMessage,
  FixResult,
  ResolvedLintConfig,
  RulesConfig,
} from '../types/index.js';
import { runRule } from './rule-runner.js';
import { applyFixes, hasOverlappingFixes } from './fixer.js';
import { allRules } from '../rules/index.js';
import { loadLintConfig, getResolvedConfig } from '../config/index.js';

export interface LinterOptions {
  config?: ResolvedLintConfig;
  cwd?: string;
  configFile?: string;
}

export class Linter {
  private config: ResolvedLintConfig;
  private cwd: string;
  private rules: Map<string, Rule>;

  constructor(options: LinterOptions = {}) {
    this.cwd = options.cwd ?? process.cwd();
    this.config = options.config ?? getResolvedConfig();
    this.rules = new Map();

    for (const rule of allRules) {
      this.rules.set(rule.meta.id, rule);
    }
  }

  async loadConfig(configFile?: string): Promise<void> {
    const loaded = await loadLintConfig(configFile, this.cwd);
    if (loaded) {
      this.config = getResolvedConfig(loaded.config);
    }
  }

  getConfig(): ResolvedLintConfig {
    return this.config;
  }

  getRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  async lint(filePathOrContent: string): Promise<LintResult> {
    const isFilePath =
      !filePathOrContent.includes('\n') &&
      (filePathOrContent.endsWith('.md') || filePathOrContent.includes('/'));

    let content: string;
    let filePath: string;

    if (isFilePath) {
      filePath = isAbsolute(filePathOrContent)
        ? filePathOrContent
        : resolve(this.cwd, filePathOrContent);
      content = await readFile(filePath, 'utf-8');
    } else {
      content = filePathOrContent;
      filePath = 'inline';
    }

    return this.lintContent(content, filePath);
  }

  async lintContent(content: string, filePath: string): Promise<LintResult> {
    const messages: LintMessage[] = [];

    let skillFile;
    try {
      skillFile = await parseSkillFile(content, { validateManifest: false });
      skillFile.path = filePath;
    } catch (error) {
      messages.push({
        ruleId: 'parse-error',
        severity: 2,
        message: error instanceof Error ? error.message : 'Failed to parse SKILL.md',
        line: 1,
        column: 1,
      });

      return this.createResult(filePath, messages, content);
    }

    for (const [ruleId, rule] of this.rules) {
      const ruleConfig = this.config.rules[ruleId];
      if (!ruleConfig) continue;

      const severity = this.getSeverity(ruleConfig);
      const options = this.getOptions(ruleConfig);

      const ruleMessages = runRule({
        skillFile,
        rule,
        severity,
        options,
        filePath,
        content,
      });

      messages.push(...ruleMessages);
    }

    return this.createResult(filePath, messages, content);
  }

  async lintFiles(patterns: string[]): Promise<LintResult[]> {
    const files = await fg(patterns, {
      cwd: this.cwd,
      absolute: true,
      ignore: this.config.ignore,
    });

    const results: LintResult[] = [];
    for (const file of files) {
      const result = await this.lint(file);
      results.push(result);
    }

    return results;
  }

  async fix(filePathOrContent: string): Promise<FixResult> {
    const isFilePath =
      !filePathOrContent.includes('\n') &&
      (filePathOrContent.endsWith('.md') || filePathOrContent.includes('/'));

    let content: string;
    let filePath: string;

    if (isFilePath) {
      filePath = isAbsolute(filePathOrContent)
        ? filePathOrContent
        : resolve(this.cwd, filePathOrContent);
      content = await readFile(filePath, 'utf-8');
    } else {
      content = filePathOrContent;
      filePath = 'inline';
    }

    return this.fixContent(content, filePath);
  }

  async fixContent(content: string, filePath: string): Promise<FixResult> {
    const MAX_ITERATIONS = 10;
    let currentContent = content;
    let fixed = false;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const result = await this.lintContent(currentContent, filePath);
      const fixableMessages = result.messages.filter((m) => m.fix);

      if (fixableMessages.length === 0) {
        break;
      }

      if (hasOverlappingFixes(fixableMessages)) {
        const nonOverlapping = this.removeOverlappingFixes(fixableMessages);
        currentContent = applyFixes(currentContent, nonOverlapping);
      } else {
        currentContent = applyFixes(currentContent, fixableMessages);
      }

      fixed = true;
    }

    const finalResult = await this.lintContent(currentContent, filePath);

    return {
      fixed,
      output: currentContent,
      messages: finalResult.messages,
    };
  }

  async fixFile(filePath: string): Promise<FixResult> {
    const absolutePath = isAbsolute(filePath) ? filePath : resolve(this.cwd, filePath);
    const content = await readFile(absolutePath, 'utf-8');
    const result = await this.fixContent(content, absolutePath);

    if (result.fixed) {
      await writeFile(absolutePath, result.output, 'utf-8');
    }

    return result;
  }

  private getSeverity(config: RulesConfig[string]): RuleSeverity {
    if (Array.isArray(config)) {
      return config[0];
    }
    return config;
  }

  private getOptions(config: RulesConfig[string]): unknown[] {
    if (Array.isArray(config) && config.length > 1) {
      return [config[1]];
    }
    return [];
  }

  private createResult(filePath: string, messages: LintMessage[], source?: string): LintResult {
    const errorCount = messages.filter((m) => m.severity === 2).length;
    const warningCount = messages.filter((m) => m.severity === 1).length;
    const fixableErrorCount = messages.filter((m) => m.severity === 2 && m.fix).length;
    const fixableWarningCount = messages.filter((m) => m.severity === 1 && m.fix).length;

    return {
      filePath,
      messages,
      errorCount,
      warningCount,
      fixableErrorCount,
      fixableWarningCount,
      source,
    };
  }

  private removeOverlappingFixes(messages: LintMessage[]): LintMessage[] {
    const sorted = [...messages].sort((a, b) => {
      if (!a.fix || !b.fix) return 0;
      return a.fix.range[0] - b.fix.range[0];
    });

    const result: LintMessage[] = [];
    let lastEnd = -1;

    for (const msg of sorted) {
      if (!msg.fix) continue;
      if (msg.fix.range[0] >= lastEnd) {
        result.push(msg);
        lastEnd = msg.fix.range[1];
      }
    }

    return result;
  }
}
