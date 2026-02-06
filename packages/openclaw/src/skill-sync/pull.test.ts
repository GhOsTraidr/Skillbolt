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
  openclawToSkillbolt: vi.fn((content: string, path: string) => ({
    path,
    manifest: { name: 'converted', description: '' },
    content,
    sections: [],
  })),
}));

import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pullSkills } from './pull.js';

const mockExistsSync = vi.mocked(existsSync);
const mockReaddirSync = vi.mocked(readdirSync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockMkdirSync = vi.mocked(mkdirSync);
const mockWriteFileSync = vi.mocked(writeFileSync);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('pullSkills', () => {
  it('returns error when openclaw skills dir missing', async () => {
    mockExistsSync.mockReturnValue(false);
    const result = await pullSkills({ sourceDir: '/nonexistent' });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.error).toContain('not found');
  });

  it('pulls skills with conversion', async () => {
    mockExistsSync.mockImplementation((p) => {
      const s = String(p);
      if (s.includes('/mock/home')) return true;
      if (s.endsWith('SKILL.md') && s.includes('/mock/home')) return true;
      return false;
    });
    mockReaddirSync.mockReturnValue([
      { name: 'remote-skill', isDirectory: () => true, isFile: () => false },
    ] as never);
    mockReadFileSync.mockReturnValue('---\nskillKey: remote\n---\ncontent');

    const result = await pullSkills();
    expect(result.pulled).toEqual(['remote-skill']);
    expect(result.converted).toEqual(['remote-skill']);
    expect(mockWriteFileSync).toHaveBeenCalled();
  });

  it('skips existing target without overwrite', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue([
      { name: 'existing', isDirectory: () => true, isFile: () => false },
    ] as never);

    const result = await pullSkills({ overwrite: false });
    expect(result.skipped).toEqual(['existing']);
  });

  it('overwrites when overwrite is true', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue([
      { name: 'existing', isDirectory: () => true, isFile: () => false },
    ] as never);
    mockReadFileSync.mockReturnValue('content');

    const result = await pullSkills({ overwrite: true });
    expect(result.pulled).toEqual(['existing']);
  });

  it('dry run does not write', async () => {
    mockExistsSync.mockImplementation((p) => {
      const s = String(p);
      return s.includes('/mock/home');
    });
    mockReaddirSync.mockReturnValue([
      { name: 'skill1', isDirectory: () => true, isFile: () => false },
    ] as never);

    const result = await pullSkills({ dryRun: true });
    expect(result.pulled).toEqual(['skill1']);
    expect(mockWriteFileSync).not.toHaveBeenCalled();
  });

  it('filters by skill names', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue([
      { name: 'a', isDirectory: () => true, isFile: () => false },
      { name: 'b', isDirectory: () => true, isFile: () => false },
    ] as never);
    mockReadFileSync.mockReturnValue('content');

    const result = await pullSkills({ skills: ['b'], overwrite: true });
    expect(result.pulled).toEqual(['b']);
  });

  it('reports error when SKILL.md missing', async () => {
    mockExistsSync.mockImplementation((p) => {
      const s = String(p);
      if (s === '/mock/home/.openclaw/workspace/skills') return true;
      return false;
    });
    mockReaddirSync.mockReturnValue([
      { name: 'broken', isDirectory: () => true, isFile: () => false },
    ] as never);

    const result = await pullSkills();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.skill).toBe('broken');
  });

  it('pulls without conversion when convert is false', async () => {
    mockExistsSync.mockImplementation((p) => {
      const s = String(p);
      if (s.includes('/mock/home')) return true;
      return false;
    });
    mockReaddirSync.mockReturnValue([
      { name: 'raw', isDirectory: () => true, isFile: () => false },
    ] as never);
    mockReadFileSync.mockReturnValue('raw content');

    const result = await pullSkills({ convert: false });
    expect(result.pulled).toEqual(['raw']);
    expect(result.converted).toEqual([]);
    const writtenContent = mockWriteFileSync.mock.calls[0]?.[1];
    expect(writtenContent).toBe('raw content');
  });
});
