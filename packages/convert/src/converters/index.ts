import type { Converter, ConversionOutput, Format, ParsedSkill } from '../types.js';
import { parseClaudeSkill } from '../parsers/claude.js';
import { ClaudeToCodexConverter, claudeToCodexConverter } from './claude-to-codex.js';
import { ClaudeToCursorConverter, claudeToCursorConverter } from './claude-to-cursor.js';
import { ClaudeToContinueConverter, claudeToContinueConverter } from './claude-to-continue.js';
import { CodexToClaudeConverter, codexToClaudeConverter } from './codex-to-claude.js';
import { CursorToClaudeConverter, cursorToClaudeConverter } from './cursor-to-claude.js';
import { ContinueToClaudeConverter, continueToClaudeConverter } from './continue-to-claude.js';

export {
  ClaudeToCodexConverter,
  ClaudeToCursorConverter,
  ClaudeToContinueConverter,
  CodexToClaudeConverter,
  CursorToClaudeConverter,
  ContinueToClaudeConverter,
};

type ConverterKey = `${Format}->${Format}`;

const converters: Partial<Record<ConverterKey, Converter>> = {
  'claude->codex': claudeToCodexConverter,
  'claude->cursor': claudeToCursorConverter,
  'claude->continue': claudeToContinueConverter,
  'codex->claude': codexToClaudeConverter,
  'cursor->claude': cursorToClaudeConverter,
  'continue->claude': continueToClaudeConverter,
};

export function getConverter(source: Format, target: Format): Converter | undefined {
  const key: ConverterKey = `${source}->${target}`;
  return converters[key];
}

export function convert(skill: ParsedSkill, source: Format, target: Format): string {
  const converter = getConverter(source, target);
  if (!converter) {
    throw new Error(`No converter available for ${source} -> ${target}`);
  }
  return converter.convert(skill);
}

export function convertWithWarnings(
  skill: ParsedSkill,
  source: Format,
  target: Format
): ConversionOutput {
  const converter = getConverter(source, target);
  if (!converter) {
    throw new Error(`No converter available for ${source} -> ${target}`);
  }
  return converter.convertWithWarnings(skill);
}

export function convertToAll(skill: ParsedSkill, source: Format): Record<Format, ConversionOutput> {
  const targets: Format[] = ['claude', 'codex', 'cursor', 'continue', 'openclaw'].filter(
    (f) => f !== source
  ) as Format[];

  const results: Partial<Record<Format, ConversionOutput>> = {};

  for (const target of targets) {
    const converter = getConverter(source, target);
    if (converter) {
      results[target] = converter.convertWithWarnings(skill);
    } else if (source !== 'claude') {
      const toClaudeConverter = getConverter(source, 'claude');
      const fromClaudeConverter = getConverter('claude', target);
      if (toClaudeConverter && fromClaudeConverter) {
        const intermediate = toClaudeConverter.convertWithWarnings(skill);
        const claudeSkill = parseClaudeSkill(intermediate.content);
        const final = fromClaudeConverter.convertWithWarnings(claudeSkill);
        results[target] = {
          content: final.content,
          warnings: [...intermediate.warnings, ...final.warnings],
        };
      }
    }
  }

  return results as Record<Format, ConversionOutput>;
}

export function getSupportedConversions(): { source: Format; target: Format }[] {
  return Object.keys(converters).map((key) => {
    const [source, target] = key.split('->') as [Format, Format];
    return { source, target };
  });
}
