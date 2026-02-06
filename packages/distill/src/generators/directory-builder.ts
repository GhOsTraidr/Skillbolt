import { promises as fs } from 'fs';
import { join } from 'path';

export interface DirectoryOptions {
  includeReferences: boolean;
  includeExamples: boolean;
  includeScripts: boolean;
}

export class DirectoryBuilder {
  async create(basePath: string, options: Partial<DirectoryOptions> = {}): Promise<void> {
    const { includeReferences = true, includeExamples = false, includeScripts = false } = options;

    await fs.mkdir(basePath, { recursive: true });

    if (includeReferences) {
      await fs.mkdir(join(basePath, 'references'), { recursive: true });
    }

    if (includeExamples) {
      await fs.mkdir(join(basePath, 'examples'), { recursive: true });
    }

    if (includeScripts) {
      await fs.mkdir(join(basePath, 'scripts'), { recursive: true });
    }
  }

  async listStructure(basePath: string): Promise<string[]> {
    const files: string[] = [];

    const walk = async (dir: string, prefix: string = ''): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          files.push(`${relativePath}/`);
          await walk(join(dir, entry.name), relativePath);
        } else {
          files.push(relativePath);
        }
      }
    };

    await walk(basePath);
    return files;
  }
}
