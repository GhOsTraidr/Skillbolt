import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import {
  TemplateEngine,
  loadTemplate,
  getTemplateEngine,
  renderTemplate,
  registerHelper,
} from '../../src/templates/engine.js';

const TEMP_DIR = join(import.meta.dirname, '../temp');

describe('TemplateEngine', () => {
  describe('compile', () => {
    it('should compile template', () => {
      const engine = new TemplateEngine();
      const compiled = engine.compile('Hello {{skill.name}}');
      const context = {
        skill: {
          name: 'World',
          description: '',
          version: '1.0.0',
          triggers: [],
          platforms: [],
          tags: [],
          sourcePath: '',
        },
        sections: { all: [], custom: [] },
        config: {
          format: 'markdown' as const,
          includeTableOfContents: false,
          includeTimestamp: false,
          timestamp: '',
        },
        variables: {},
      };

      expect(compiled(context)).toBe('Hello World');
    });
  });

  describe('registerHelper', () => {
    it('should register custom helper', () => {
      const engine = new TemplateEngine();
      engine.registerHelper('shout', (text: unknown) => String(text).toUpperCase());

      const template = '{{shout skill.name}}';
      const context = {
        skill: {
          name: 'hello',
          description: '',
          version: '1.0.0',
          triggers: [],
          platforms: [],
          tags: [],
          sourcePath: '',
        },
        sections: { all: [], custom: [] },
        config: {
          format: 'markdown' as const,
          includeTableOfContents: false,
          includeTimestamp: false,
          timestamp: '',
        },
        variables: {},
      };

      expect(engine.render(template, context)).toBe('HELLO');
    });
  });

  describe('registerPartial', () => {
    it('should register and use partial', () => {
      const engine = new TemplateEngine();
      engine.registerPartial('header', '# {{skill.name}}');

      const template = '{{> header}}\n\nContent';
      const context = {
        skill: {
          name: 'Test',
          description: '',
          version: '1.0.0',
          triggers: [],
          platforms: [],
          tags: [],
          sourcePath: '',
        },
        sections: { all: [], custom: [] },
        config: {
          format: 'markdown' as const,
          includeTableOfContents: false,
          includeTimestamp: false,
          timestamp: '',
        },
        variables: {},
      };

      expect(engine.render(template, context)).toBe('# Test\nContent');
    });
  });

  describe('renderFile', () => {
    beforeEach(async () => {
      await mkdir(TEMP_DIR, { recursive: true });
    });

    afterEach(async () => {
      await rm(TEMP_DIR, { recursive: true, force: true });
    });

    it('should render template from file', async () => {
      const templatePath = join(TEMP_DIR, 'test.hbs');
      await writeFile(templatePath, '# {{skill.name}}');

      const engine = new TemplateEngine();
      const context = {
        skill: {
          name: 'Test',
          description: '',
          version: '1.0.0',
          triggers: [],
          platforms: [],
          tags: [],
          sourcePath: '',
        },
        sections: { all: [], custom: [] },
        config: {
          format: 'markdown' as const,
          includeTableOfContents: false,
          includeTimestamp: false,
          timestamp: '',
        },
        variables: {},
      };

      const result = await engine.renderFile(templatePath, context);
      expect(result).toBe('# Test');
    });

    it('should cache compiled template', async () => {
      const templatePath = join(TEMP_DIR, 'cached.hbs');
      await writeFile(templatePath, '# {{skill.name}}');

      const engine = new TemplateEngine();
      const context = {
        skill: {
          name: 'Test',
          description: '',
          version: '1.0.0',
          triggers: [],
          platforms: [],
          tags: [],
          sourcePath: '',
        },
        sections: { all: [], custom: [] },
        config: {
          format: 'markdown' as const,
          includeTableOfContents: false,
          includeTimestamp: false,
          timestamp: '',
        },
        variables: {},
      };

      await engine.renderFile(templatePath, context);
      const result = await engine.renderFile(templatePath, context);
      expect(result).toBe('# Test');
    });
  });

  describe('clearCache', () => {
    it('should clear template cache', () => {
      const engine = new TemplateEngine();
      engine.clearCache();
    });
  });
});

describe('loadTemplate', () => {
  beforeEach(async () => {
    await mkdir(TEMP_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEMP_DIR, { recursive: true, force: true });
  });

  it('should load custom template when provided', async () => {
    const customPath = join(TEMP_DIR, 'custom.hbs');
    await writeFile(customPath, 'Custom: {{skill.name}}');

    const template = await loadTemplate(customPath, 'readme');
    expect(template).toBe('Custom: {{skill.name}}');
  });

  it('should load built-in template when path not provided', async () => {
    const template = await loadTemplate(undefined, 'readme');
    expect(template).toContain('{{skill.name}}');
  });
});

describe('getTemplateEngine', () => {
  it('should return singleton engine', () => {
    const engine1 = getTemplateEngine();
    const engine2 = getTemplateEngine();
    expect(engine1).toBe(engine2);
  });
});

describe('renderTemplate', () => {
  it('should render template using default engine', () => {
    const context = {
      skill: {
        name: 'Test',
        description: '',
        version: '1.0.0',
        triggers: [],
        platforms: [],
        tags: [],
        sourcePath: '',
      },
      sections: { all: [], custom: [] },
      config: {
        format: 'markdown' as const,
        includeTableOfContents: false,
        includeTimestamp: false,
        timestamp: '',
      },
      variables: {},
    };

    const result = renderTemplate('Hello {{skill.name}}', context);
    expect(result).toBe('Hello Test');
  });
});

describe('registerHelper', () => {
  it('should register helper on default engine', () => {
    registerHelper('testHelper', () => 'test');
  });
});
