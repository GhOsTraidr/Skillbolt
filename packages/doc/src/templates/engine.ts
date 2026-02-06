import Handlebars from 'handlebars';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { TemplateContext, HelperFunction, CompiledTemplate } from '../types/index.js';
import { defaultHelpers } from './helpers.js';

import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getTemplatesDir(): string {
  const devPath = resolve(__dirname, '../../templates');
  const distPath = resolve(__dirname, '../templates');

  if (existsSync(devPath)) return devPath;
  if (existsSync(distPath)) return distPath;
  return devPath;
}

const TEMPLATES_DIR = getTemplatesDir();

const templateCache = new Map<string, CompiledTemplate>();

export class TemplateEngine {
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerDefaultHelpers();
  }

  private registerDefaultHelpers(): void {
    const helpers = defaultHelpers();
    for (const [name, fn] of Object.entries(helpers)) {
      this.handlebars.registerHelper(name, fn as Handlebars.HelperDelegate);
    }
  }

  registerHelper(name: string, fn: HelperFunction): void {
    this.handlebars.registerHelper(name, fn as Handlebars.HelperDelegate);
  }

  registerPartial(name: string, template: string): void {
    this.handlebars.registerPartial(name, template);
  }

  compile(template: string): CompiledTemplate {
    const compiled = this.handlebars.compile(template);
    return (context: TemplateContext) => compiled(context);
  }

  render(template: string, context: TemplateContext): string {
    const compiled = this.compile(template);
    return compiled(context);
  }

  async renderFile(templatePath: string, context: TemplateContext): Promise<string> {
    const absolutePath = resolve(templatePath);
    const cached = templateCache.get(absolutePath);

    if (cached) {
      return cached(context);
    }

    const template = await readFile(absolutePath, 'utf-8');
    const compiled = this.compile(template);
    templateCache.set(absolutePath, compiled);

    return compiled(context);
  }

  clearCache(): void {
    templateCache.clear();
  }
}

export async function loadBuiltInTemplate(name: string): Promise<string> {
  const templatePath = resolve(TEMPLATES_DIR, `${name}.hbs`);
  return readFile(templatePath, 'utf-8');
}

export async function loadTemplate(
  templatePath: string | undefined,
  builtInName: string
): Promise<string> {
  if (templatePath) {
    return readFile(resolve(templatePath), 'utf-8');
  }
  return loadBuiltInTemplate(builtInName);
}

let defaultEngine: TemplateEngine | null = null;

export function getTemplateEngine(): TemplateEngine {
  if (!defaultEngine) {
    defaultEngine = new TemplateEngine();
  }
  return defaultEngine;
}

export function renderTemplate(template: string, context: TemplateContext): string {
  return getTemplateEngine().render(template, context);
}

export function registerHelper(name: string, fn: HelperFunction): void {
  getTemplateEngine().registerHelper(name, fn);
}
