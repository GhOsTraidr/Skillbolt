import { describe, it, expect } from 'vitest';
import {
  normalizePath,
  expandTilde,
  slugify,
  truncate,
  capitalize,
  camelCase,
  kebabCase,
  pascalCase,
  countWords,
  dedent,
} from '../../src/utils/index.js';
import { homedir } from 'node:os';

describe('normalizePath', () => {
  it('should normalize path separators', () => {
    expect(normalizePath('foo\\bar\\baz')).toBe('foo/bar/baz');
    expect(normalizePath('foo/bar/baz')).toBe('foo/bar/baz');
  });

  it('should remove redundant separators', () => {
    expect(normalizePath('foo//bar///baz')).toBe('foo/bar/baz');
  });
});

describe('expandTilde', () => {
  it('should expand tilde to home directory', () => {
    expect(expandTilde('~/test')).toBe(`${homedir()}/test`);
    expect(expandTilde('~/.config')).toBe(`${homedir()}/.config`);
  });

  it('should not modify paths without tilde', () => {
    expect(expandTilde('/absolute/path')).toBe('/absolute/path');
    expect(expandTilde('relative/path')).toBe('relative/path');
  });
});

describe('slugify', () => {
  it('should convert text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('  Hello   World  ')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
    expect(slugify('test@example.com')).toBe('testexamplecom');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('truncate', () => {
  it('should truncate long text', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });

  it('should not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should use custom suffix', () => {
    expect(truncate('Hello World', 9, '…')).toBe('Hello Wo…');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('camelCase', () => {
  it('should convert to camelCase', () => {
    expect(camelCase('hello world')).toBe('helloWorld');
    expect(camelCase('hello-world')).toBe('helloWorld');
    expect(camelCase('hello_world')).toBe('helloWorld');
  });
});

describe('kebabCase', () => {
  it('should convert to kebab-case', () => {
    expect(kebabCase('helloWorld')).toBe('hello-world');
    expect(kebabCase('Hello World')).toBe('hello-world');
    expect(kebabCase('hello_world')).toBe('hello-world');
  });
});

describe('pascalCase', () => {
  it('should convert to PascalCase', () => {
    expect(pascalCase('hello world')).toBe('HelloWorld');
    expect(pascalCase('hello-world')).toBe('HelloWorld');
  });
});

describe('countWords', () => {
  it('should count words', () => {
    expect(countWords('Hello World')).toBe(2);
    expect(countWords('One two three four')).toBe(4);
  });

  it('should handle empty string', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });
});

describe('dedent', () => {
  it('should remove common indentation', () => {
    const text = `
      line 1
      line 2
      line 3
    `;
    const result = dedent(text);
    expect(result).toBe('\nline 1\nline 2\nline 3\n');
  });

  it('should handle mixed indentation', () => {
    const text = `
      line 1
        line 2
      line 3
    `;
    const result = dedent(text);
    expect(result).toContain('line 1');
    expect(result).toContain('  line 2');
  });
});
