import { describe, it, expect } from 'vitest';
import { parseOpenClawFrontmatter, openclawToSkillbolt, skillKitToOpenClaw } from './parser.js';

describe('parseOpenClawFrontmatter', () => {
  it('parses valid frontmatter', () => {
    const content = '---\nskillKey: my-skill\nprimaryEnv: node\n---\n# Hello\n\nBody text';
    const { frontmatter, body } = parseOpenClawFrontmatter(content);
    expect(frontmatter.skillKey).toBe('my-skill');
    expect(frontmatter.primaryEnv).toBe('node');
    expect(body).toContain('# Hello');
  });

  it('returns empty frontmatter for content without frontmatter', () => {
    const content = 'Just plain text without any frontmatter';
    const { frontmatter, body } = parseOpenClawFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe(content);
  });

  it('handles empty frontmatter block', () => {
    const content = '---\n\n---\nSome body';
    const { frontmatter, body } = parseOpenClawFrontmatter(content);
    expect(Object.keys(frontmatter).length).toBe(0);
    expect(body).toBe(content);
  });

  it('handles CRLF line endings', () => {
    const content = '---\r\nskillKey: test\r\n---\r\nBody';
    const { frontmatter, body } = parseOpenClawFrontmatter(content);
    expect(frontmatter.skillKey).toBe('test');
    expect(body).toBe('Body');
  });

  it('ignores lines without key-value format', () => {
    const content = '---\nskillKey: valid\njust a comment\n---\nBody';
    const { frontmatter } = parseOpenClawFrontmatter(content);
    expect(frontmatter.skillKey).toBe('valid');
    expect(Object.keys(frontmatter)).toEqual(['skillKey']);
  });

  it('trims values', () => {
    const content = '---\nskillKey:   spaces   \n---\nBody';
    const { frontmatter } = parseOpenClawFrontmatter(content);
    expect(frontmatter.skillKey).toBe('spaces');
  });
});

describe('openclawToSkillbolt', () => {
  it('converts frontmatter to manifest', () => {
    const content = '---\nskillKey: deploy\nprimaryEnv: docker\n---\nDeploy containers\n\n## Setup\n\nSetup steps';
    const skill = openclawToSkillbolt(content, '/path/to/SKILL.md');
    expect(skill.manifest.name).toBe('deploy');
    expect(skill.manifest.tags).toEqual(['docker']);
    expect(skill.manifest.platform).toEqual(['openclaw']);
    expect(skill.path).toBe('/path/to/SKILL.md');
  });

  it('uses first non-empty line as description', () => {
    const content = '---\nskillKey: test\n---\n\nThe description line\n\nMore content';
    const skill = openclawToSkillbolt(content, 'test.md');
    expect(skill.manifest.description).toBe('The description line');
  });

  it('extracts sections from headings', () => {
    const content = '---\nskillKey: test\n---\n## First\n\nContent 1\n\n## Second\n\nContent 2';
    const skill = openclawToSkillbolt(content, 'test.md');
    expect(skill.sections.length).toBe(2);
    expect(skill.sections[0]?.title).toBe('First');
    expect(skill.sections[0]?.content).toBe('Content 1');
    expect(skill.sections[1]?.title).toBe('Second');
    expect(skill.sections[1]?.content).toBe('Content 2');
  });

  it('handles no sections', () => {
    const content = '---\nskillKey: test\n---\nJust body text with no headings';
    const skill = openclawToSkillbolt(content, 'test.md');
    expect(skill.sections.length).toBe(0);
  });

  it('defaults name to unknown without skillKey', () => {
    const content = '---\nother: value\n---\nBody';
    const skill = openclawToSkillbolt(content, 'test.md');
    expect(skill.manifest.name).toBe('unknown');
  });

  it('handles no frontmatter', () => {
    const content = '# Title\n\nSome content';
    const skill = openclawToSkillbolt(content, 'test.md');
    expect(skill.manifest.name).toBe('unknown');
    expect(skill.sections.length).toBe(1);
  });
});

describe('skillKitToOpenClaw', () => {
  it('generates frontmatter with skillKey', () => {
    const output = skillKitToOpenClaw({
      path: 'test.md',
      manifest: { name: 'my-skill', description: 'desc' },
      content: '',
      sections: [],
    });
    expect(output).toContain('skillKey: my-skill');
    expect(output).toMatch(/^---\n/);
  });

  it('includes primaryEnv from first tag', () => {
    const output = skillKitToOpenClaw({
      path: 'test.md',
      manifest: { name: 'test', description: '', tags: ['python', 'ml'] },
      content: '',
      sections: [],
    });
    expect(output).toContain('primaryEnv: python');
  });

  it('omits primaryEnv when no tags', () => {
    const output = skillKitToOpenClaw({
      path: 'test.md',
      manifest: { name: 'test', description: '', tags: [] },
      content: '',
      sections: [],
    });
    expect(output).not.toContain('primaryEnv');
  });

  it('renders sections as headings', () => {
    const output = skillKitToOpenClaw({
      path: 'test.md',
      manifest: { name: 'test', description: '' },
      content: '',
      sections: [
        { type: 'custom', title: 'Setup', content: 'Do this', lineStart: 1, lineEnd: 2 },
        { type: 'custom', title: 'Run', content: 'Do that', lineStart: 3, lineEnd: 4 },
      ],
    });
    expect(output).toContain('## Setup\n\nDo this');
    expect(output).toContain('## Run\n\nDo that');
  });

  it('roundtrips through parse and back', () => {
    const original = '---\nskillKey: roundtrip\nprimaryEnv: node\n---\n## Setup\n\nInstall things\n\n## Usage\n\nRun things';
    const skill = openclawToSkillbolt(original, 'test.md');
    const output = skillKitToOpenClaw(skill);
    expect(output).toContain('skillKey: roundtrip');
    expect(output).toContain('primaryEnv: node');
    expect(output).toContain('## Setup');
    expect(output).toContain('## Usage');
  });
});
