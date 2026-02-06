import type { SkillFile } from '@skillbolt/core';
import type {
  Rule,
  RuleContext,
  RuleVisitor,
  ReportDescriptor,
  LintMessage,
  RuleSeverity,
  FixInfo,
} from '../types/index.js';
import { createFixer } from './fixer.js';

export function createRule(rule: Rule): Rule {
  return rule;
}

export interface RunRuleOptions {
  skillFile: SkillFile;
  rule: Rule;
  severity: RuleSeverity;
  options: unknown[];
  filePath: string;
  content: string;
}

export function runRule(opts: RunRuleOptions): LintMessage[] {
  const { skillFile, rule, severity, options, filePath, content } = opts;

  if (severity === 'off') {
    return [];
  }

  const messages: LintMessage[] = [];
  const fixer = createFixer(content);

  const context: RuleContext = {
    skillFile,
    options,
    filePath,
    content,
    report(descriptor: ReportDescriptor): void {
      let fix: FixInfo | undefined;
      if (descriptor.fix && rule.meta.fixable) {
        const fixResult = descriptor.fix(fixer);
        if (fixResult) {
          fix = fixResult;
        }
      }

      messages.push({
        ruleId: rule.meta.id,
        severity: severity === 'error' ? 2 : 1,
        message: descriptor.message,
        line: descriptor.line,
        column: descriptor.column ?? 1,
        endLine: descriptor.endLine,
        endColumn: descriptor.endColumn,
        fix,
      });
    },
  };

  const visitor = rule.create(context);

  executeVisitor(visitor, skillFile);

  return messages;
}

function executeVisitor(visitor: RuleVisitor, skillFile: SkillFile): void {
  if (visitor.SkillFile) {
    visitor.SkillFile(skillFile);
  }

  if (visitor.Manifest) {
    visitor.Manifest(skillFile.manifest);
  }

  if (visitor.Section) {
    for (let i = 0; i < skillFile.sections.length; i++) {
      const section = skillFile.sections[i];
      if (section) {
        visitor.Section(section, i);
      }
    }
  }

  if (visitor.Content) {
    visitor.Content(skillFile.content);
  }
}
