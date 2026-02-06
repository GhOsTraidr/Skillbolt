import { parseSkillFile } from '@skillbolt/core';
import { resolve, relative } from 'node:path';

import type { IndexItem, OutputFormat, BatchSuccessItem } from '../types/index.js';
import { loadTemplate, getTemplateEngine } from '../templates/index.js';
import { writeOutput } from '../output/writer.js';
import { toHtml } from '../output/html.js';

export async function generateIndex(
  items: BatchSuccessItem[],
  outputDir: string,
  format: OutputFormat = 'markdown'
): Promise<string> {
  const indexItems: IndexItem[] = [];

  for (const item of items) {
    try {
      const skill = await parseSkillFile(item.inputPath);
      const docPath = relative(outputDir, item.outputPath);

      indexItems.push({
        name: skill.manifest.name,
        description: skill.manifest.description,
        version: skill.manifest.version,
        docPath,
        sourcePath: relative(outputDir, item.inputPath),
        tags: skill.manifest.tags ?? [],
      });
    } catch {
      continue;
    }
  }

  indexItems.sort((a, b) => a.name.localeCompare(b.name));

  const template = await loadTemplate(undefined, 'index');
  const engine = getTemplateEngine();

  const context = {
    items: indexItems,
    title: 'Skills Documentation',
    skill: {
      name: 'Index',
      description: '',
      version: '1.0.0',
      triggers: [],
      platforms: [],
      tags: [],
      sourcePath: '',
    },
    sections: { all: [], custom: [] },
    config: {
      format,
      includeTableOfContents: false,
      includeTimestamp: false,
      timestamp: new Date().toISOString(),
    },
    variables: {},
  };

  let content = engine.render(template, context);

  if (format === 'html') {
    content = await toHtml(content, { title: 'Skills Index' });
  }

  const ext = format === 'html' ? '.html' : '.md';
  const indexPath = resolve(outputDir, `INDEX${ext}`);

  await writeOutput({
    outputPath: indexPath,
    content,
    createDirs: true,
  });

  return indexPath;
}
