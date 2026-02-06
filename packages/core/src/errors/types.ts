import { SkillboltError } from './base.js';

import type { ErrorDetails } from './base.js';

export class ParseError extends SkillboltError {
  constructor(message: string, details: ErrorDetails = {}) {
    super(message, 'PARSE_ERROR', details);
    this.name = 'ParseError';
  }
}

export class ConfigError extends SkillboltError {
  constructor(message: string, details: ErrorDetails = {}) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

export class ValidationError extends SkillboltError {
  constructor(message: string, details: ErrorDetails = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class FileError extends SkillboltError {
  constructor(message: string, details: ErrorDetails = {}) {
    super(message, 'FILE_ERROR', details);
    this.name = 'FileError';
  }
}

export class LLMError extends SkillboltError {
  readonly provider: string;
  readonly statusCode?: number;

  constructor(message: string, provider: string, statusCode?: number, details: ErrorDetails = {}) {
    super(message, 'LLM_ERROR', { ...details, provider, statusCode });
    this.name = 'LLMError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

export class TimeoutError extends SkillboltError {
  readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number, details: ErrorDetails = {}) {
    super(message, 'TIMEOUT_ERROR', { ...details, timeoutMs });
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class ExecutionError extends SkillboltError {
  readonly nodeId?: string;
  readonly phase?: string;

  constructor(message: string, nodeId?: string, phase?: string, details: ErrorDetails = {}) {
    super(message, 'EXECUTION_ERROR', { ...details, nodeId, phase });
    this.name = 'ExecutionError';
    this.nodeId = nodeId;
    this.phase = phase;
  }
}

export class SearchError extends SkillboltError {
  readonly query: string;

  constructor(message: string, query: string, details: ErrorDetails = {}) {
    super(message, 'SEARCH_ERROR', { ...details, query });
    this.name = 'SearchError';
    this.query = query;
  }
}

export class TreeBuildError extends SkillboltError {
  readonly nodeId?: string;

  constructor(message: string, nodeId?: string, details: ErrorDetails = {}) {
    super(message, 'TREE_BUILD_ERROR', { ...details, nodeId });
    this.name = 'TreeBuildError';
    this.nodeId = nodeId;
  }
}
