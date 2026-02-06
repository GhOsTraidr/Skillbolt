import { describe, it, expect } from 'vitest';
import { extractExecutionSummary } from '../src/orchestrator/summary.js';

describe('extractExecutionSummary', () => {
  it('extracts SUCCESS status from execution_summary tags', () => {
    const response = '<execution_summary>STATUS: SUCCESS\n1. Done</execution_summary>';
    const result = extractExecutionSummary(response);
    expect(result.isSuccess).toBe(true);
    expect(result.summary).toBe('STATUS: SUCCESS\n1. Done');
  });

  it('extracts FAILURE status from execution_summary tags', () => {
    const response = '<execution_summary>STATUS: FAILURE\nSomething went wrong</execution_summary>';
    const result = extractExecutionSummary(response);
    expect(result.isSuccess).toBe(false);
    expect(result.summary).toBe('STATUS: FAILURE\nSomething went wrong');
  });

  it('returns plain text as summary when no tags present', () => {
    const response = 'This is plain text without tags';
    const result = extractExecutionSummary(response);
    expect(result.isSuccess).toBe(true);
    expect(result.summary).toBe('This is plain text without tags');
  });

  it('returns empty summary for empty tags', () => {
    const response = '<execution_summary></execution_summary>';
    const result = extractExecutionSummary(response);
    expect(result.isSuccess).toBe(true);
    expect(result.summary).toBe('');
  });

  it('handles case-insensitive status matching', () => {
    const response = '<execution_summary>status: success\nTask completed</execution_summary>';
    const result = extractExecutionSummary(response);
    expect(result.isSuccess).toBe(true);
    expect(result.summary).toBe('status: success\nTask completed');
  });

  it('extracts inner content only when text exists before and after tags', () => {
    const response =
      'Some text before<execution_summary>STATUS: SUCCESS\nContent</execution_summary>Text after';
    const result = extractExecutionSummary(response);
    expect(result.isSuccess).toBe(true);
    expect(result.summary).toBe('STATUS: SUCCESS\nContent');
  });

  it('preserves multi-line summary content', () => {
    const response = `<execution_summary>STATUS: SUCCESS
1. First step completed
2. Second step completed
3. Third step completed</execution_summary>`;
    const result = extractExecutionSummary(response);
    expect(result.isSuccess).toBe(true);
    expect(result.summary).toContain('1. First step completed');
    expect(result.summary).toContain('2. Second step completed');
    expect(result.summary).toContain('3. Third step completed');
  });

  it('defaults to success when no STATUS field in tags', () => {
    const response = '<execution_summary>Just some text without status</execution_summary>';
    const result = extractExecutionSummary(response);
    expect(result.isSuccess).toBe(true);
    expect(result.summary).toBe('Just some text without status');
  });
});
