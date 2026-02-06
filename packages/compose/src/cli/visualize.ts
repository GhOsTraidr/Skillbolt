import { logger } from '@skillbolt/core';
import { parseWorkflowFile } from '../parser/yaml.js';
import { toAscii, toSimpleAscii } from '../visualize/ascii.js';
import { toMermaid, toMermaidWithStyles } from '../visualize/mermaid.js';
import * as fs from 'node:fs/promises';

export type OutputFormat = 'ascii' | 'simple' | 'mermaid' | 'mermaid-styled';

export interface VisualizeOptions {
  file: string;
  format?: OutputFormat;
  output?: string;
}

export async function visualizeCommand(options: VisualizeOptions): Promise<void> {
  const { file, format = 'simple', output } = options;

  logger.info(`Loading workflow from: ${file}`);

  const workflowFile = await parseWorkflowFile(file, { validate: true, strict: true });
  const { workflow } = workflowFile;

  let visualization: string;

  switch (format) {
    case 'ascii':
      visualization = toAscii(workflow);
      break;
    case 'simple':
      visualization = toSimpleAscii(workflow);
      break;
    case 'mermaid':
      visualization = toMermaid(workflow);
      break;
    case 'mermaid-styled':
      visualization = toMermaidWithStyles(workflow);
      break;
    default:
      throw new Error(`Unknown format: ${format}`);
  }

  if (output) {
    await fs.writeFile(output, visualization, 'utf-8');
    logger.success(`Visualization written to: ${output}`);
  } else {
    console.log(visualization);
  }
}

export function visualizeWorkflow(
  workflowPath: string,
  format: OutputFormat = 'simple'
): Promise<void> {
  return visualizeCommand({ file: workflowPath, format });
}
