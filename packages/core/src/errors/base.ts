export type ErrorCode =
  | 'SKILL_KIT_ERROR'
  | 'PARSE_ERROR'
  | 'CONFIG_ERROR'
  | 'VALIDATION_ERROR'
  | 'FILE_ERROR'
  | 'LLM_ERROR'
  | 'TIMEOUT_ERROR'
  | 'EXECUTION_ERROR'
  | 'SEARCH_ERROR'
  | 'TREE_BUILD_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorDetails {
  line?: number;
  column?: number;
  file?: string;
  cause?: Error;
  [key: string]: unknown;
}

export class SkillboltError extends Error {
  readonly code: ErrorCode;
  readonly details: ErrorDetails;

  constructor(message: string, code: ErrorCode = 'SKILL_KIT_ERROR', details: ErrorDetails = {}) {
    super(message);
    this.name = 'SkillboltError';
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
