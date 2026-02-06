import type { SkillFile } from '@skillbolt/core';

export type RuleSeverity = 'off' | 'warn' | 'error';
export type RuleCategory = 'format' | 'style' | 'best-practices' | 'references';

export interface RuleMeta {
  id: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;
  fixable?: boolean;
  docs?: {
    url?: string;
    recommended?: boolean;
  };
}

export interface FixInfo {
  range: [number, number];
  text: string;
}

export interface Fixer {
  replaceText(oldText: string, newText: string): FixInfo | null;
  replaceTextRange(range: [number, number], text: string): FixInfo;
  insertTextAfter(offset: number, text: string): FixInfo;
  insertTextBefore(offset: number, text: string): FixInfo;
  remove(range: [number, number]): FixInfo;
}

export interface ReportDescriptor {
  message: string;
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  fix?: (fixer: Fixer) => FixInfo | null;
}

export interface RuleContext {
  skillFile: SkillFile;
  options: unknown[];
  filePath: string;
  content: string;
  report(descriptor: ReportDescriptor): void;
}

export interface RuleVisitor {
  SkillFile?: (skillFile: SkillFile) => void;
  Manifest?: (manifest: SkillFile['manifest']) => void;
  Section?: (section: SkillFile['sections'][number], index: number) => void;
  Content?: (content: string) => void;
}

export interface Rule {
  meta: RuleMeta;
  create(context: RuleContext): RuleVisitor;
}

export type RuleModule = Rule;
