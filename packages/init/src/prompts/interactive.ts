import { input, select } from '@inquirer/prompts';
import type { SkillMetadata, TemplateType, PlatformType } from '../types.js';
import { DEFAULTS, TEMPLATE_CHOICES, PLATFORM_CHOICES } from '../types.js';
import { validateName, validateDescription, filterTriggers } from './questions.js';

export async function runInteractivePrompts(
  defaults?: Partial<SkillMetadata>
): Promise<SkillMetadata> {
  const result: Partial<SkillMetadata> = { ...defaults };

  if (!result.name) {
    result.name = await input({
      message: 'Skill name:',
      validate: (value: string) => {
        const validation = validateName(value);
        return validation === true ? true : validation;
      },
    });
  }

  if (!result.description) {
    result.description = await input({
      message: 'Short description:',
      validate: (value: string) => {
        const validation = validateDescription(value);
        return validation === true ? true : validation;
      },
    });
  }

  if (!result.triggers || result.triggers.length === 0) {
    const triggersInput = await input({
      message: 'Trigger phrases (comma separated):',
      default: '',
    });
    result.triggers = filterTriggers(triggersInput);
  }

  if (!result.template) {
    result.template = await select<TemplateType>({
      message: 'Choose a template:',
      choices: TEMPLATE_CHOICES.map((c) => ({
        name: c.name,
        value: c.value,
      })),
      default: DEFAULTS.template,
    });
  }

  if (!result.platform) {
    result.platform = await select<PlatformType>({
      message: 'Target platform:',
      choices: PLATFORM_CHOICES.map((c) => ({
        name: c.name,
        value: c.value,
      })),
      default: DEFAULTS.platform,
    });
  }

  if (!result.name || !result.description) {
    throw new Error('Name and description are required');
  }

  return {
    name: result.name,
    description: result.description,
    triggers: result.triggers ?? [],
    template: result.template ?? DEFAULTS.template,
    platform: result.platform ?? DEFAULTS.platform,
    version: result.version ?? DEFAULTS.version,
    author: result.author,
  };
}
