import { parseFrontmatter } from '@skillbolt/core';
import type { DetectResult, Format } from '../types.js';

interface DetectionRule {
  check: (content: string) => boolean;
  weight: number;
  indicator: string;
}

const claudeRules: DetectionRule[] = [
  {
    check: (c) => {
      const { data, isEmpty } = parseFrontmatter(c);
      return !isEmpty && typeof data.name === 'string' && typeof data.description === 'string';
    },
    weight: 40,
    indicator: 'YAML frontmatter with name/description',
  },
  {
    check: (c) => {
      const { data } = parseFrontmatter(c);
      return typeof data.description === 'string' && /^this skill/i.test(data.description);
    },
    weight: 30,
    indicator: 'Third-person description format',
  },
  {
    check: (c) => /##\s+(Overview|Core Workflow)/i.test(c),
    weight: 20,
    indicator: '## Overview or ## Core Workflow sections',
  },
  {
    check: (c) => {
      const { data } = parseFrontmatter(c);
      return Array.isArray(data.triggers);
    },
    weight: 10,
    indicator: 'triggers array in frontmatter',
  },
];

const codexRules: DetectionRule[] = [
  {
    check: (c) => {
      const { data, isEmpty } = parseFrontmatter(c);
      const rawData = data as Record<string, unknown>;
      return !isEmpty && typeof rawData['model'] === 'string';
    },
    weight: 50,
    indicator: 'model field in frontmatter',
  },
  {
    check: (c) => /##\s+Capabilities/i.test(c),
    weight: 25,
    indicator: '## Capabilities section',
  },
  {
    check: (c) => {
      const { data, isEmpty } = parseFrontmatter(c);
      return !isEmpty && typeof data.name === 'string' && /^[a-z0-9-]+$/.test(data.name);
    },
    weight: 25,
    indicator: 'kebab-case name in frontmatter',
  },
];

const cursorRules: DetectionRule[] = [
  {
    check: (c) => {
      const { isEmpty } = parseFrontmatter(c);
      return isEmpty;
    },
    weight: 30,
    indicator: 'No frontmatter',
  },
  {
    check: (c) => /##\s+Workflow\s+Rules/i.test(c),
    weight: 35,
    indicator: '## Workflow Rules section',
  },
  {
    check: (c) => /##\s+Constraints/i.test(c),
    weight: 35,
    indicator: '## Constraints section',
  },
];

const continueRules: DetectionRule[] = [
  {
    check: (c) => {
      try {
        JSON.parse(c);
        return true;
      } catch {
        return false;
      }
    },
    weight: 40,
    indicator: 'Valid JSON format',
  },
  {
    check: (c) => {
      try {
        const parsed = JSON.parse(c) as unknown;
        return (
          typeof parsed === 'object' &&
          parsed !== null &&
          'customCommands' in parsed &&
          Array.isArray((parsed as { customCommands: unknown }).customCommands)
        );
      } catch {
        return false;
      }
    },
    weight: 60,
    indicator: 'JSON with customCommands array',
  },
];

const allRules: Record<Format, DetectionRule[]> = {
  claude: claudeRules,
  codex: codexRules,
  cursor: cursorRules,
  continue: continueRules,
  openclaw: claudeRules,
};

function scoreFormat(
  content: string,
  rules: DetectionRule[]
): { score: number; indicators: string[] } {
  let score = 0;
  const indicators: string[] = [];

  for (const rule of rules) {
    try {
      if (rule.check(content)) {
        score += rule.weight;
        indicators.push(rule.indicator);
      }
    } catch {}
  }

  return { score, indicators };
}

export function detectFormat(content: string): DetectResult {
  const results: { format: Format; score: number; indicators: string[] }[] = [];

  for (const [format, rules] of Object.entries(allRules) as [Format, DetectionRule[]][]) {
    const { score, indicators } = scoreFormat(content, rules);
    results.push({ format, score, indicators });
  }

  results.sort((a, b) => b.score - a.score);

  const best = results[0];
  if (!best || best.score === 0) {
    return {
      format: 'claude',
      confidence: 0,
      indicators: ['No clear format indicators found, defaulting to Claude'],
    };
  }

  const totalPossible = allRules[best.format].reduce((sum, r) => sum + r.weight, 0);
  const confidence = Math.min(100, Math.round((best.score / totalPossible) * 100));

  return {
    format: best.format,
    confidence,
    indicators: best.indicators,
  };
}

export function detectFormatFromPath(filePath: string): Format | null {
  const lower = filePath.toLowerCase();

  if (lower.endsWith('.cursorrules') || lower.includes('cursorrules')) {
    return 'cursor';
  }
  if (lower.includes('agents/') && lower.endsWith('.md')) {
    return 'codex';
  }
  if (lower.endsWith('config.json') && lower.includes('continue')) {
    return 'continue';
  }
  if (lower.endsWith('skill.md')) {
    return 'claude';
  }

  return null;
}
