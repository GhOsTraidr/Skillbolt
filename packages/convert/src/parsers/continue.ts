import type { ParsedSkill, Parser } from '../types.js';

interface ContinueCommand {
  name: string;
  description?: string;
  prompt: string;
}

interface ContinueConfig {
  customCommands?: ContinueCommand[];
}

interface RawSection {
  name: string;
  contentLines: string[];
  level: number;
}

function extractSectionsFromPrompt(
  prompt: string
): { name: string; content: string; level: number }[] {
  const lines = prompt.split('\n');
  const rawSections: RawSection[] = [];
  let current: RawSection | null = null;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match?.[1]) {
      if (current) {
        rawSections.push(current);
      }
      current = { name: h2Match[1].trim(), contentLines: [], level: 2 };
    } else if (current) {
      current.contentLines.push(line);
    }
  }

  if (current) {
    rawSections.push(current);
  }

  return rawSections.map((s) => ({
    name: s.name,
    content: s.contentLines.join('\n').trim(),
    level: s.level,
  }));
}

export function parseContinueSkill(content: string, commandName?: string): ParsedSkill {
  let config: ContinueConfig;
  try {
    config = JSON.parse(content) as ContinueConfig;
  } catch {
    throw new Error('Invalid JSON format for Continue config');
  }

  const commands = config.customCommands ?? [];
  if (commands.length === 0) {
    throw new Error('No customCommands found in Continue config');
  }

  const command = commandName ? commands.find((c) => c.name === commandName) : commands[0];

  if (!command) {
    throw new Error(`Command "${commandName}" not found in Continue config`);
  }

  return {
    metadata: {
      name: command.name,
      description: command.description ?? '',
    },
    sections: extractSectionsFromPrompt(command.prompt),
    rawContent: command.prompt,
  };
}

export function parseContinueConfig(content: string): ParsedSkill[] {
  let config: ContinueConfig;
  try {
    config = JSON.parse(content) as ContinueConfig;
  } catch {
    throw new Error('Invalid JSON format for Continue config');
  }

  const commands = config.customCommands ?? [];
  return commands.map((command) => ({
    metadata: {
      name: command.name,
      description: command.description ?? '',
    },
    sections: extractSectionsFromPrompt(command.prompt),
    rawContent: command.prompt,
  }));
}

export const continueParser: Parser = {
  format: 'continue',

  parse(content: string): ParsedSkill {
    return parseContinueSkill(content);
  },

  canParse(content: string): boolean {
    try {
      const parsed = JSON.parse(content) as unknown;
      return (
        typeof parsed === 'object' &&
        parsed !== null &&
        'customCommands' in parsed &&
        Array.isArray((parsed as ContinueConfig).customCommands)
      );
    } catch {
      return false;
    }
  },
};
