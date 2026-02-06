import { describe, it, expect } from 'vitest';
import { ExitCode } from '../src/types.js';

describe('ExitCode', () => {
  it('has correct values', () => {
    expect(ExitCode.SUCCESS).toBe(0);
    expect(ExitCode.ERROR).toBe(1);
    expect(ExitCode.INVALID_ARGUMENT).toBe(2);
    expect(ExitCode.COMMAND_NOT_FOUND).toBe(127);
  });
});
