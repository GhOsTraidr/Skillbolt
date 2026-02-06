import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { DEFAULT_SKILL_GROUPS, SKILL_GROUP_ALIASES } from './types.js';
import type { SkillGroup } from './types.js';
import { expandTilde } from '@skillbolt/core';

const CONFIG_FILE = '.skillbolt-groups.json';
const CONFIG_DIR = '~/.skill-kit'

export class GroupManager {
  private groups: SkillGroup[];
  private activeGroupId: string;
  private configPath: string;

  constructor(configDir?: string) {
    this.configPath = expandTilde(join(configDir || CONFIG_DIR, CONFIG_FILE));
    this.groups = [...DEFAULT_SKILL_GROUPS];
    this.activeGroupId = 'curated';
    this.load();
  }

  private load(): void {
    if (!existsSync(this.configPath)) return;
    try {
      const data = JSON.parse(readFileSync(this.configPath, 'utf8'));
      if (data.activeGroupId) this.activeGroupId = data.activeGroupId;
      if (Array.isArray(data.customGroups)) {
        for (const g of data.customGroups) {
          if (g.id && !this.groups.find((x) => x.id === g.id)) {
            this.groups.push(g);
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  private save(): void {
    const dir = dirname(this.configPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const customGroups = this.groups.filter(
      (g) => !DEFAULT_SKILL_GROUPS.find((d) => d.id === g.id)
    );
    writeFileSync(
      this.configPath,
      JSON.stringify({ activeGroupId: this.activeGroupId, customGroups }, null, 2),
      'utf8'
    );
  }

  listGroups(): Array<SkillGroup & { active: boolean }> {
    return this.groups.map((g) => ({ ...g, active: g.id === this.activeGroupId }));
  }

  getActiveGroup(): SkillGroup {
    return this.groups.find((g) => g.id === this.activeGroupId) || this.groups[0]!;
  }

  switchGroup(groupId: string): SkillGroup {
    const resolved = SKILL_GROUP_ALIASES[groupId] ?? groupId;
    const group = this.groups.find((g) => g.id === resolved);
    if (!group) throw new Error(`Unknown skill group: ${groupId}`);
    this.activeGroupId = resolved;
    this.save();
    return group;
  }

  setCustomGroup(skillsDir: string, treePath: string, description?: string): SkillGroup {
    const existing = this.groups.find((g) => g.id === 'custom');
    const custom: SkillGroup = {
      id: 'custom',
      name: 'Custom',
      description: description || `Custom group: ${skillsDir}`,
      skillsDir,
      treePath,
    };
    if (existing) {
      Object.assign(existing, custom);
    } else {
      this.groups.push(custom);
    }
    this.activeGroupId = 'custom';
    this.save();
    return custom;
  }

  /**
   * Set a custom group with a specific name
   * @param name - The display name of the group (will be sanitized to create id)
   * @param skillsDir - Path to skills directory
   * @param treePath - Path to tree file
   * @param description - Optional description
   */
  setCustomGroupByName(
    name: string,
    skillsDir: string,
    treePath: string,
    description?: string
  ): SkillGroup {
    // Sanitize name to create id: remove special characters and spaces, convert to lowercase
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = this.groups.find((g) => g.id === id);
    const customGroup: SkillGroup = {
      id,
      name,
      description: description || `Custom group ${name} with skills in ${skillsDir}`,
      skillsDir,
      treePath,
    };

    if (existing) {
      // Update existing group
      Object.assign(existing, customGroup);
    } else {
      // Create new group
      this.groups.push(customGroup);
    }

    this.activeGroupId = id;
    this.save();
    return customGroup;
  }
}
