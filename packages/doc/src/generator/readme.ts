import type { ReadmeOptions, GeneratorResult } from '../types/index.js';
import { createTemplateContext } from '../types/template.js';
import { loadTemplate, getTemplateEngine } from '../templates/index.js';
import { generateToc } from './toc.js';
import { toMarkdown } from '../output/markdown.js';
import { toHtml } from '../output/html.js';

export async function generateReadme(options: ReadmeOptions): Promise<GeneratorResult> {
  const {
    skill,
    format = 'markdown',
    templatePath,
    variables = {},
    includeToc = true,
    includeTimestamp = false,
  } = options;

  const toc = includeToc ? generateToc(skill) : undefined;

  const context = createTemplateContext(skill, {
    format,
    includeToc,
    includeTimestamp,
    variables,
    toc,
  });

  const template = await loadTemplate(templatePath, 'readme');
  const engine = getTemplateEngine();
  let content = engine.render(template, context);

  if (format === 'html') {
    content = await toHtml(content, { title: skill.manifest.name });
  } else {
    content = toMarkdown(content);
  }

  return {
    content,
    format,
    metadata: {
      generatedAt: new Date(),
      sourceFile: skill.path,
      templateUsed: templatePath ?? 'readme.hbs',
      generatorVersion: '1.0.0',
    },
  };
}
