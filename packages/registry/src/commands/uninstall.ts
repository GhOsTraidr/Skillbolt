import type { UninstallOptions, UninstallResult } from '../types/registry.js';
import { LocalStorage } from '../storage/local.js';
import { MetadataManager } from '../storage/metadata.js';
import { withLock } from '../storage/lock.js';

export async function uninstallSkill(options: UninstallOptions): Promise<UninstallResult> {
  const { name, storagePath } = options;

  const storage = new LocalStorage(storagePath);
  const metadata = new MetadataManager();

  return withLock('uninstall', async () => {
    const skill = await metadata.getSkill(name);
    if (!skill) {
      return {
        success: false,
        name,
        message: `Skill "${name}" is not installed`,
      };
    }

    try {
      await storage.removeSkill(name);
      await metadata.removeSkill(name);

      return {
        success: true,
        name,
        message: `Uninstalled skill "${name}"`,
      };
    } catch (error) {
      return {
        success: false,
        name,
        message: `Failed to uninstall skill: ${(error as Error).message}`,
        error: error as Error,
      };
    }
  });
}
