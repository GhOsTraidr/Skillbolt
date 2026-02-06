import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock('@skillbolt/core', () => ({
  expandTilde: vi.fn((p: string) => p.replace('~', '/mock/home')),
}));

vi.mock('../config.js', () => ({
  resolveOpenClawConfig: vi.fn(() => ({
    skillsDir: '~/.openclaw/workspace/skills',
  })),
}));

vi.mock('../converter/parser.js', () => ({
  skillKitToOpenClaw: vi.fn(() => '---\nskillKey: converted\n---\nconverted content\n'),
}));

import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pushSkills } from './push.js';

const mockExistsSync = vi.mocked(existsSync);
const mockReaddirSync = vi.mocked(readdirSync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockMkdirSync = vi.mocked(mkdirSync);
const mockWriteFileSync = vi.mocked(writeFileSync);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('pushSkills', () => {
  it('returns error when source directory missing', async () => {
    mockExistsSync.mockReturnValue(false);
    const result = await pushSkills({ sourceDir: '/nonexistent' });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.error).toContain('Source directory not found');
  });

  it('pushes skills with conversion', async () => {
    mockExistsSync.mockImplementation((p) => {
      const s = String(p);
      if (s === '.claude/skills') return true;
      if (s.endsWith('SKILL.md') && s.includes('.claude')) return true;
      return false;
    });
    mockReaddirSync.mockReturnValue([
      { name: 'my-skill', isDirectory: () => true, isFile: () => false },
    ] as never);
    mockReadFileSync.mockReturnValue('# Skill content');

    const result = await pushSkills();
    expect(result.pushed).toEqual(['my-skill']);
    expect(result.converted).toEqual(['my-skill']);
    expect(mockMkdirSync).toHaveBeenCalled();
    expect(mockWriteFileSync).toHaveBeenCalled();
  });

  it('skips existing target when overwrite is false', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue([
      { name: 'existing', isDirectory: () => true, isFile: () => false },
    ] as never);

    const result = await pushSkills({ overwrite: false });
    expect(result.skipped).toEqual(['existing']);
    expect(result.pushed).toEqual([]);
  });

  it('overwrites when overwrite is true', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue([
      { name: 'existing', isDirectory: () => true, isFile: () => false },
    ] as never);
    mockReadFileSync.mockReturnValue('content');

    const result = await pushSkills({ overwrite: true });
    expect(result.pushed).toEqual(['existing']);
    expect(mockWriteFileSync).toHaveBeenCalled();
  });

  it('dry run does not write files', async () => {
    mockExistsSync.mockImplementation((p) => {
      const s = String(p);
      if (s === '.claude/skills') return true;
      if (s.endsWith('SKILL.md') && s.includes('.claude')) return true;
      return false;
    });
    mockReaddirSync.mockReturnValue([
      { name: 'skill1', isDirectory: () => true, isFile: () => false },
    ] as never);

    const result = await pushSkills({ dryRun: true });
    expect(result.pushed).toEqual(['skill1']);
    expect(mockWriteFileSync).not.toHaveBeenCalled();
    expect(mockMkdirSync).not.toHaveBeenCalled();
  });

  it('filters skills by name', async () => {
    mockExistsSync.mockImplementation((p) => {
      const s = String(p);
      return s === '.claude/skills' || s.endsWith('SKILL.md');
    });
    mockReaddirSync.mockReturnValue([
      { name: 'a', isDirectory: () => true, isFile: () => false },
      { name: 'b', isDirectory: () => true, isFile: () => false },
    ] as never);
    mockReadFileSync.mockReturnValue('content');

    const result = await pushSkills({ skills: ['a'], overwrite: true });
    expect(result.pushed).toEqual(['a']);
  });

  it('reports error when SKILL.md missing in skill dir', async () => {
    mockExistsSync.mockImplementation((p) => {
      if (String(p) === '.claude/skills') return true;
      return false;
    });
    mockReaddirSync.mockReturnValue([
      { name: 'broken', isDirectory: () => true, isFile: () => false },
    ] as never);

    const result = await pushSkills();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.skill).toBe('broken');
    expect(result.errors[0]?.error).toContain('No SKILL.md found');
  });

  it('pushes without conversion when convert is false', async () => {
    mockExistsSync.mockImplementation((p) => {
      const s = String(p);
      if (s === '.claude/skills') return true;
      if (s.endsWith('SKILL.md') && s.includes('.claude')) return true;
      return false;
    });
    mockReaddirSync.mockReturnValue([
      { name: 'raw', isDirectory: () => true, isFile: () => false },
    ] as never);
    mockReadFileSync.mockReturnValue('raw content');

    const result = await pushSkills({ convert: false });
    expect(result.pushed).toEqual(['raw']);
    expect(result.converted).toEqual([]);
    const writtenContent = mockWriteFileSync.mock.calls[0]?.[1];
    expect(writtenContent).toBe('raw content');
  });
});
