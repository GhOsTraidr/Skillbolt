import type { HelperFunction } from '../types/index.js';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0] ?? '';
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length - 3) + '...';
}

export function joinArray(arr: unknown[], separator = ', '): string {
  return arr.filter(Boolean).join(separator);
}

export function indent(text: string, spaces = 2): string {
  const prefix = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => prefix + line)
    .join('\n');
}

export function codeBlock(code: string, language = ''): string {
  return '```' + language + '\n' + code + '\n```';
}

export function anchor(text: string): string {
  return '#' + slugify(text);
}

export function ifEquals(
  a: unknown,
  b: unknown,
  options: { fn: () => string; inverse: () => string }
): string {
  return a === b ? options.fn() : options.inverse();
}

export function ifNotEmpty(
  value: unknown,
  options: { fn: () => string; inverse: () => string }
): string {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);
  return isEmpty ? options.inverse() : options.fn();
}

export function times(
  n: number,
  options: { fn: (data: { index: number; first: boolean; last: boolean }) => string }
): string {
  let result = '';
  for (let i = 0; i < n; i++) {
    result += options.fn({ index: i, first: i === 0, last: i === n - 1 });
  }
  return result;
}

export function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function defaultHelpers(): Record<string, HelperFunction> {
  return {
    slugify: (text: unknown) => slugify(String(text)),
    formatDate: (date: unknown) => formatDate(date as Date | string),
    capitalize: (text: unknown) => capitalize(String(text)),
    truncate: (text: unknown, length: unknown) => truncate(String(text), Number(length) || 100),
    join: (arr: unknown, sep: unknown) => joinArray(arr as unknown[], String(sep ?? ', ')),
    indent: (text: unknown, spaces: unknown) => indent(String(text), Number(spaces) || 2),
    codeBlock: (code: unknown, lang: unknown) => codeBlock(String(code), String(lang ?? '')),
    anchor: (text: unknown) => anchor(String(text)),
    json: (value: unknown) => json(value),
    eq: ifEquals as unknown as HelperFunction,
    notEmpty: ifNotEmpty as unknown as HelperFunction,
    times: times as unknown as HelperFunction,
  };
}
