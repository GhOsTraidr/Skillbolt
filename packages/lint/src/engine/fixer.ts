import type { Fixer, FixInfo, LintMessage } from '../types/index.js';

export function createFixer(content: string): Fixer {
  return {
    replaceText(oldText: string, newText: string): FixInfo | null {
      const index = content.indexOf(oldText);
      if (index === -1) {
        return null;
      }
      return {
        range: [index, index + oldText.length],
        text: newText,
      };
    },

    replaceTextRange(range: [number, number], text: string): FixInfo {
      return { range, text };
    },

    insertTextAfter(offset: number, text: string): FixInfo {
      return {
        range: [offset, offset],
        text,
      };
    },

    insertTextBefore(offset: number, text: string): FixInfo {
      return {
        range: [offset, offset],
        text,
      };
    },

    remove(range: [number, number]): FixInfo {
      return {
        range,
        text: '',
      };
    },
  };
}

export function applyFixes(content: string, messages: LintMessage[]): string {
  const fixes = messages
    .filter((m) => m.fix)
    .map((m) => m.fix!)
    .sort((a, b) => b.range[0] - a.range[0]);

  let result = content;
  for (const fix of fixes) {
    result = result.slice(0, fix.range[0]) + fix.text + result.slice(fix.range[1]);
  }

  return result;
}

export function hasOverlappingFixes(messages: LintMessage[]): boolean {
  const fixes = messages
    .filter((m) => m.fix)
    .map((m) => m.fix!)
    .sort((a, b) => a.range[0] - b.range[0]);

  for (let i = 0; i < fixes.length - 1; i++) {
    const current = fixes[i];
    const next = fixes[i + 1];
    if (current && next && current.range[1] > next.range[0]) {
      return true;
    }
  }

  return false;
}
