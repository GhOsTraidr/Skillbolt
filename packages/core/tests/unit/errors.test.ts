import { describe, it, expect } from 'vitest';
import {
  SkillboltError,
  ParseError,
  ConfigError,
  ValidationError,
  FileError,
  LLMError,
  TimeoutError,
  ExecutionError,
  SearchError,
  TreeBuildError,
} from '../../src/errors/index.js';

describe('SkillboltError', () => {
  it('should create error with message and code', () => {
    const error = new SkillboltError('Test error', 'SKILL_KIT_ERROR');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('SKILL_KIT_ERROR');
    expect(error.name).toBe('SkillboltError');
  });

  it('should include details', () => {
    const error = new SkillboltError('Test error', 'SKILL_KIT_ERROR', {
      line: 10,
      file: 'test.md',
    });

    expect(error.details.line).toBe(10);
    expect(error.details.file).toBe('test.md');
  });

  it('should be instanceof Error', () => {
    const error = new SkillboltError('Test');
    expect(error).toBeInstanceOf(Error);
  });

  it('should serialize to JSON', () => {
    const error = new SkillboltError('Test error', 'PARSE_ERROR', { line: 5 });
    const json = error.toJSON();

    expect(json.name).toBe('SkillboltError');
    expect(json.code).toBe('PARSE_ERROR');
    expect(json.message).toBe('Test error');
    expect(json.details).toEqual({ line: 5 });
  });
});

describe('ParseError', () => {
  it('should have PARSE_ERROR code', () => {
    const error = new ParseError('Invalid syntax');

    expect(error.code).toBe('PARSE_ERROR');
    expect(error.name).toBe('ParseError');
  });

  it('should include line details', () => {
    const error = new ParseError('Invalid syntax', { line: 10 });

    expect(error.details.line).toBe(10);
  });
});

describe('ConfigError', () => {
  it('should have CONFIG_ERROR code', () => {
    const error = new ConfigError('Config not found');

    expect(error.code).toBe('CONFIG_ERROR');
    expect(error.name).toBe('ConfigError');
  });
});

describe('ValidationError', () => {
  it('should have VALIDATION_ERROR code', () => {
    const error = new ValidationError('Invalid value');

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
  });
});

describe('FileError', () => {
  it('should have FILE_ERROR code', () => {
    const error = new FileError('File not found', { file: 'test.md' });

    expect(error.code).toBe('FILE_ERROR');
    expect(error.name).toBe('FileError');
    expect(error.details.file).toBe('test.md');
  });
});

describe('LLMError', () => {
  it('should have LLM_ERROR code and provider', () => {
    const error = new LLMError('API failed', 'openai', 500);

    expect(error.code).toBe('LLM_ERROR');
    expect(error.name).toBe('LLMError');
    expect(error.provider).toBe('openai');
    expect(error.statusCode).toBe(500);
    expect(error.details.provider).toBe('openai');
    expect(error.details.statusCode).toBe(500);
  });

  it('should work without statusCode', () => {
    const error = new LLMError('No content', 'anthropic');

    expect(error.provider).toBe('anthropic');
    expect(error.statusCode).toBeUndefined();
  });

  it('should be instanceof SkillboltError', () => {
    const error = new LLMError('fail', 'openai');
    expect(error).toBeInstanceOf(SkillboltError);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('TimeoutError', () => {
  it('should have TIMEOUT_ERROR code and timeoutMs', () => {
    const error = new TimeoutError('Timed out', 30000);

    expect(error.code).toBe('TIMEOUT_ERROR');
    expect(error.name).toBe('TimeoutError');
    expect(error.timeoutMs).toBe(30000);
    expect(error.details.timeoutMs).toBe(30000);
  });
});

describe('ExecutionError', () => {
  it('should have EXECUTION_ERROR code with nodeId and phase', () => {
    const error = new ExecutionError('Node failed', 'node-1', 'execute');

    expect(error.code).toBe('EXECUTION_ERROR');
    expect(error.name).toBe('ExecutionError');
    expect(error.nodeId).toBe('node-1');
    expect(error.phase).toBe('execute');
  });

  it('should work without optional fields', () => {
    const error = new ExecutionError('Generic failure');

    expect(error.nodeId).toBeUndefined();
    expect(error.phase).toBeUndefined();
  });
});

describe('SearchError', () => {
  it('should have SEARCH_ERROR code and query', () => {
    const error = new SearchError('No results', 'git commit helper');

    expect(error.code).toBe('SEARCH_ERROR');
    expect(error.name).toBe('SearchError');
    expect(error.query).toBe('git commit helper');
    expect(error.details.query).toBe('git commit helper');
  });
});

describe('TreeBuildError', () => {
  it('should have TREE_BUILD_ERROR code', () => {
    const error = new TreeBuildError('Build failed', 'root-node');

    expect(error.code).toBe('TREE_BUILD_ERROR');
    expect(error.name).toBe('TreeBuildError');
    expect(error.nodeId).toBe('root-node');
  });

  it('should work without nodeId', () => {
    const error = new TreeBuildError('Generic build error');

    expect(error.nodeId).toBeUndefined();
  });
});
