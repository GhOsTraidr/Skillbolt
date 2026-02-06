import type { SkillSection, SkillSectionType } from '../types/skill.js';

const SECTION_TYPE_MAP: Record<string, SkillSectionType> = {
  overview: 'overview',
  introduction: 'overview',
  summary: 'overview',
  workflow: 'workflow',
  'core workflow': 'workflow',
  steps: 'workflow',
  process: 'workflow',
  parameters: 'parameters',
  params: 'parameters',
  options: 'parameters',
  configuration: 'parameters',
  examples: 'examples',
  example: 'examples',
  usage: 'examples',
  errors: 'errors',
  'error handling': 'errors',
  troubleshooting: 'errors',
};

function inferSectionType(title: string): SkillSectionType {
  const normalizedTitle = title.toLowerCase().trim();

  for (const [keyword, type] of Object.entries(SECTION_TYPE_MAP)) {
    if (normalizedTitle.includes(keyword)) {
      return type;
    }
  }

  return 'custom';
}

interface RawSection {
  title: string;
  content: string;
  lineStart: number;
  lineEnd: number;
}

function extractRawSections(content: string): RawSection[] {
  const lines = content.split('\n');
  const sections: RawSection[] = [];
  let currentSection: RawSection | null = null;
  let contentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const lineNumber = i + 1;

    const h2Match = line.match(/^##\s+(.+)$/);
    const matchedTitle = h2Match?.[1];

    if (h2Match && matchedTitle) {
      if (currentSection) {
        currentSection.content = contentLines.join('\n').trim();
        currentSection.lineEnd = lineNumber - 1;
        sections.push(currentSection);
      }

      currentSection = {
        title: matchedTitle.trim(),
        content: '',
        lineStart: lineNumber,
        lineEnd: lineNumber,
      };
      contentLines = [];
    } else if (currentSection) {
      contentLines.push(line);
    }
  }

  if (currentSection) {
    currentSection.content = contentLines.join('\n').trim();
    currentSection.lineEnd = lines.length;
    sections.push(currentSection);
  }

  return sections;
}

export function parseSections(content: string): SkillSection[] {
  const rawSections = extractRawSections(content);

  return rawSections.map((raw) => ({
    type: inferSectionType(raw.title),
    title: raw.title,
    content: raw.content,
    lineStart: raw.lineStart,
    lineEnd: raw.lineEnd,
  }));
}

export function getLineNumber(content: string, index: number): number {
  const substring = content.slice(0, index);
  return substring.split('\n').length;
}

export function getSectionByType(
  sections: SkillSection[],
  type: SkillSectionType
): SkillSection | undefined {
  return sections.find((s) => s.type === type);
}

export function getSectionsByType(
  sections: SkillSection[],
  type: SkillSectionType
): SkillSection[] {
  return sections.filter((s) => s.type === type);
}
