import { writeFile, chmod } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import type { TemplateContext, TemplateType } from '../types.js';
import { loadTemplate } from '../templates/loader.js';
import { renderTemplateFile } from '../templates/renderer.js';

export async function generateFiles(
  targetDir: string,
  template: TemplateType,
  context: TemplateContext
): Promise<string[]> {
  const templateFiles = await loadTemplate(template);
  const generatedFiles: string[] = [];

  for (const file of templateFiles) {
    const rendered = renderTemplateFile(file, context);
    const fullPath = join(targetDir, rendered.path);
    const fileDir = dirname(fullPath);

    await mkdir(fileDir, { recursive: true });
    await writeFile(fullPath, rendered.content, 'utf-8');

    if (rendered.path.endsWith('.sh')) {
      await chmod(fullPath, 0o755);
    }

    generatedFiles.push(rendered.path);
  }

  return generatedFiles;
}
