import type { Format, ParsedSkill, Parser } from '../types.js';
import { claudeParser, parseClaudeSkill } from './claude.js';
import { codexParser, parseCodexSkill } from './codex.js';
import { cursorParser, parseCursorSkill } from './cursor.js';
import { continueParser, parseContinueSkill, parseContinueConfig } from './continue.js';

export {
  parseClaudeSkill,
  parseCodexSkill,
  parseCursorSkill,
  parseContinueSkill,
  parseContinueConfig,
};

const parsers: Record<Format, Parser> = {
  claude: claudeParser,
  codex: codexParser,
  cursor: cursorParser,
  continue: continueParser,
  openclaw: claudeParser, // OpenClaw uses a similar markdown format to Claude
};

export function getParser(format: Format): Parser {
  return parsers[format];
}

export function parseSkill(content: string, format: Format): ParsedSkill {
  const parser = parsers[format];
  return parser.parse(content);
}

export function parseSkillAuto(content: string): { skill: ParsedSkill; format: Format } {
  for (const [format, parser] of Object.entries(parsers) as [Format, Parser][]) {
    if (parser.canParse(content)) {
      return { skill: parser.parse(content), format };
    }
  }

  return { skill: claudeParser.parse(content), format: 'claude' };
}
