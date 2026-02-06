import { describe, it, expect } from 'vitest';
import {
  loadTemplate,
  getTemplateFiles,
  getTemplateDefinition,
} from '../../src/templates/loader.js';

describe('template loader', () => {
  describe('loadTemplate', () => {
    it('should load minimal template', async () => {
      const files = await loadTemplate('minimal');
      expect(files).toHaveLength(1);
      expect(files[0]?.path).toBe('SKILL.md');
    });

    it('should load standard template', async () => {
      const files = await loadTemplate('standard');
      expect(files.map((f) => f.path)).toContain('SKILL.md');
      expect(files.map((f) => f.path)).toContain('README.md');
      expect(files.map((f) => f.path)).toContain('references/patterns.md');
    });

    it('should load complete template', async () => {
      const files = await loadTemplate('complete');
      expect(files.map((f) => f.path)).toContain('SKILL.md');
      expect(files.map((f) => f.path)).toContain('README.md');
      expect(files.map((f) => f.path)).toContain('references/patterns.md');
      expect(files.map((f) => f.path)).toContain('references/advanced.md');
      expect(files.map((f) => f.path)).toContain('examples/example.sh');
      expect(files.map((f) => f.path)).toContain('scripts/validate.sh');
    });

    it('should throw for invalid template', async () => {
      await expect(loadTemplate('invalid' as any)).rejects.toThrow('Unknown template: invalid');
    });

    it('should return files with content', async () => {
      const files = await loadTemplate('minimal');
      expect(files[0]?.content).toBeDefined();
      expect(files[0]?.content.length).toBeGreaterThan(0);
      expect(files[0]?.content).toContain('{{name}}');
    });
  });

  describe('getTemplateFiles', () => {
    it('should return minimal template files', () => {
      const files = getTemplateFiles('minimal');
      expect(files).toEqual(['SKILL.md']);
    });

    it('should return standard template files', () => {
      const files = getTemplateFiles('standard');
      expect(files).toEqual(['SKILL.md', 'README.md', 'references/patterns.md']);
    });

    it('should return complete template files', () => {
      const files = getTemplateFiles('complete');
      expect(files).toEqual([
        'SKILL.md',
        'README.md',
        'references/patterns.md',
        'references/advanced.md',
        'examples/example.sh',
        'scripts/validate.sh',
      ]);
    });

    it('should throw for invalid template', () => {
      expect(() => getTemplateFiles('invalid' as any)).toThrow('Unknown template type: invalid');
    });
  });

  describe('getTemplateDefinition', () => {
    it('should return minimal template definition', async () => {
      const def = await getTemplateDefinition('minimal');
      expect(def.type).toBe('minimal');
      expect(def.directories).toEqual([]);
      expect(def.files.length).toBeGreaterThan(0);
    });

    it('should return standard template definition', async () => {
      const def = await getTemplateDefinition('standard');
      expect(def.type).toBe('standard');
      expect(def.directories).toContain('references');
    });

    it('should return complete template definition', async () => {
      const def = await getTemplateDefinition('complete');
      expect(def.type).toBe('complete');
      expect(def.directories).toContain('references');
      expect(def.directories).toContain('examples');
      expect(def.directories).toContain('scripts');
    });
  });
});
