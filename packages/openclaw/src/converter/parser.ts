import type { SkillFile, SkillManifest, SkillSection } from '@skillbolt/core';

export interface OpenClawSkillFrontmatter {
  skillKey?: string;
  primaryEnv?: string;
  requirements?: {
    bins?: string[];
    env?: string[];
    config?: string[];
  };
  install?: Array<{ id: string; label: string; command: string }>;
  [key: string]: unknown;
}

export function parseOpenClawFrontmatter(content: string): {
  frontmatter: OpenClawSkillFrontmatter;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match || !match[1] || !match[2]) {
    return { frontmatter: {}, body: content };
  }

  const yamlStr = match[1];
  const body = match[2];

  const frontmatter: OpenClawSkillFrontmatter = {};
  for (const line of yamlStr.split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv && kv[1] && kv[2]) {
      frontmatter[kv[1]] = kv[2].trim();
    }
  }

  return { frontmatter, body };
}

export function openclawToSkillbolt(content: string, filePath: string): SkillFile {
  const { frontmatter, body } = parseOpenClawFrontmatter(content);

  const skillKey = frontmatter.skillKey;
  const primaryEnv = frontmatter.primaryEnv;

  const manifest: SkillManifest = {
    name: typeof skillKey === 'string' ? skillKey : 'unknown',
    description: body.split('\n').find((l) => l.trim().length > 0) ?? '',
    platform: ['openclaw'],
    tags: [],
  };

  if (primaryEnv) {
    manifest.tags = [String(primaryEnv)];
  }

  const sections: SkillSection[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let lastIndex = 0;
  let regexMatch: RegExpExecArray | null;

  while ((regexMatch = headingRegex.exec(body)) !== null) {
    if (lastIndex > 0 && sections.length > 0) {
      const prevContent = body.slice(lastIndex, regexMatch.index).trim();
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        lastSection.content = prevContent;
      }
    }
    const title = regexMatch[2] ?? '';
    sections.push({
      type: 'custom',
      title,
      content: '',
      lineStart: body.slice(0, regexMatch.index).split('\n').length,
      lineEnd: 0,
    });
    lastIndex = regexMatch.index + regexMatch[0].length;
  }
  if (sections.length > 0 && lastIndex < body.length) {
    const lastSection = sections[sections.length - 1];
    if (lastSection) {
      lastSection.content = body.slice(lastIndex).trim();
    }
  }

  return { path: filePath, manifest, content, sections };
}

export function skillKitToOpenClaw(skill: SkillFile): string {
  const fm = [
    '---',
    `skillKey: ${skill.manifest.name}`,
  ];

  if (skill.manifest.tags && skill.manifest.tags.length > 0) {
    fm.push(`primaryEnv: ${skill.manifest.tags[0]}`);
  }

  fm.push('---');

  const body = skill.sections.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n');

  return `${fm.join('\n')}\n\n${body}\n`;
}
