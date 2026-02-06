import Handlebars from 'handlebars';
import type { TemplateContext, TemplateFile } from '../types.js';

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

Handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);

Handlebars.registerHelper('or', (...args: unknown[]) => {
  args.pop();
  return args.some(Boolean);
});

Handlebars.registerHelper('and', (...args: unknown[]) => {
  args.pop();
  return args.every(Boolean);
});

Handlebars.registerHelper('default', (value: unknown, defaultValue: unknown) => {
  return value ?? defaultValue;
});

Handlebars.registerHelper('join', (arr: string[], separator: string) => {
  if (!Array.isArray(arr)) return '';
  return arr.join(typeof separator === 'string' ? separator : ', ');
});

Handlebars.registerHelper('first', (arr: unknown[]) => {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr[0];
});

Handlebars.registerHelper('len', (arr: unknown[] | string) => {
  if (Array.isArray(arr)) return arr.length;
  if (typeof arr === 'string') return arr.length;
  return 0;
});

export function renderTemplate(template: string, context: TemplateContext): string {
  const compiled = Handlebars.compile(template, { noEscape: true });
  return compiled(context);
}

export function renderTemplateFile(
  file: TemplateFile,
  context: TemplateContext
): { path: string; content: string } {
  const renderedPath = renderTemplate(file.path, context);
  const renderedContent = renderTemplate(file.content, context);
  return { path: renderedPath, content: renderedContent };
}

export function createTemplateContext(
  name: string,
  description: string,
  triggers: string[],
  platform: TemplateContext['platform'],
  version: string,
  author?: string
): TemplateContext {
  const now = new Date();
  const kebabName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    name,
    description,
    triggers,
    platform,
    version,
    year: now.getFullYear(),
    date: now.toISOString().split('T')[0] ?? '',
    author,
    kebabName,
  };
}
