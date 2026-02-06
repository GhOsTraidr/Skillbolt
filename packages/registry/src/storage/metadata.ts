import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { exists } from '@skillbolt/core';

import type { InstalledRegistry, InstalledSkill } from '../types/registry.js';

const REGISTRY_VERSION = '1.0.0';

export class MetadataManager {
  private readonly metadataPath: string;
  private cache: InstalledRegistry | null = null;

  constructor(customPath?: string) {
    this.metadataPath = customPath ?? this.getDefaultMetadataPath();
  }

  getMetadataPath(): string {
    return this.metadataPath;
  }

  async load(): Promise<InstalledRegistry> {
    if (this.cache) {
      return this.cache;
    }

    if (!(await exists(this.metadataPath))) {
      this.cache = this.createEmptyRegistry();
      return this.cache;
    }

    try {
      const content = await readFile(this.metadataPath, 'utf-8');
      const data = JSON.parse(content) as InstalledRegistry;
      this.cache = this.migrate(data);
      return this.cache;
    } catch (error) {
      throw new Error(`Failed to load registry metadata: ${(error as Error).message}`);
    }
  }

  async save(registry: InstalledRegistry): Promise<void> {
    const dir = dirname(this.metadataPath);
    if (!(await exists(dir))) {
      await mkdir(dir, { recursive: true });
    }

    const content = JSON.stringify(registry, null, 2);
    await writeFile(this.metadataPath, content, 'utf-8');
    this.cache = registry;
  }

  async getSkill(name: string): Promise<InstalledSkill | undefined> {
    const registry = await this.load();
    return registry.skills.find((s) => s.name === name);
  }

  async addSkill(skill: InstalledSkill): Promise<void> {
    const registry = await this.load();
    const existingIndex = registry.skills.findIndex((s) => s.name === skill.name);

    if (existingIndex >= 0) {
      registry.skills[existingIndex] = skill;
    } else {
      registry.skills.push(skill);
    }

    await this.save(registry);
  }

  async updateSkill(
    name: string,
    updates: Partial<InstalledSkill>
  ): Promise<InstalledSkill | undefined> {
    const registry = await this.load();
    const index = registry.skills.findIndex((s) => s.name === name);

    if (index < 0) {
      return undefined;
    }

    const existing = registry.skills[index];
    if (!existing) {
      return undefined;
    }

    const updated: InstalledSkill = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    registry.skills[index] = updated;
    await this.save(registry);

    return updated;
  }

  async removeSkill(name: string): Promise<boolean> {
    const registry = await this.load();
    const initialLength = registry.skills.length;
    registry.skills = registry.skills.filter((s) => s.name !== name);

    if (registry.skills.length !== initialLength) {
      await this.save(registry);
      return true;
    }

    return false;
  }

  async listSkills(): Promise<InstalledSkill[]> {
    const registry = await this.load();
    return [...registry.skills].sort((a, b) => a.name.localeCompare(b.name));
  }

  async hasSkill(name: string): Promise<boolean> {
    const skill = await this.getSkill(name);
    return skill !== undefined;
  }

  clearCache(): void {
    this.cache = null;
  }

  private getDefaultMetadataPath(): string {
    return join(homedir(), '.skill-kit', 'installed.json');
  }

  private createEmptyRegistry(): InstalledRegistry {
    return {
      version: REGISTRY_VERSION,
      skills: [],
    };
  }

  private migrate(registry: InstalledRegistry): InstalledRegistry {
    if (!registry.version) {
      registry.version = REGISTRY_VERSION;
    }

    if (!Array.isArray(registry.skills)) {
      registry.skills = [];
    }

    return registry;
  }
}
