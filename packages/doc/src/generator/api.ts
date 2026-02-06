import type { ApiDocOptions, GeneratorResult } from '../types/index.js';
import { createTemplateContext } from '../types/template.js';
import { loadTemplate, getTemplateEngine } from '../templates/index.js';
import { toMarkdown } from '../output/markdown.js';
import { toHtml } from '../output/html.js';

export async function generateApiDocs(options: ApiDocOptions): Promise<GeneratorResult> {
  const {
    skill,
    format = 'markdown',
    templatePath,
    variables = {},
    includeToc = false,
    includeTimestamp = false,
  } = options;

  const context = createTemplateContext(skill, {
    format,
    includeToc,
    includeTimestamp,
    variables,
  });

  const template = await loadTemplate(templatePath, 'api');
  const engine = getTemplateEngine();
  let content = engine.render(template, context);

  if (format === 'html') {
    content = await toHtml(content, { title: `${skill.manifest.name} API` });
  } else {
    content = toMarkdown(content);
  }

  return {
    content,
    format,
    metadata: {
      generatedAt: new Date(),
      sourceFile: skill.path,
      templateUsed: templatePath ?? 'api.hbs',
      generatorVersion: '1.0.0',
    },
  };
}
