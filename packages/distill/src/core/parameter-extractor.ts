import type { SkillStep, SkillParameter } from '../types/skill.js';
import type { DistilledStep } from './llm-engine.js';

interface ExtractResult {
  steps: SkillStep[];
  parameters: SkillParameter[];
}

interface PatternConfig {
  regex: RegExp;
  type: 'path' | 'directory' | 'name' | 'port' | 'url';
}

const PATTERNS: PatternConfig[] = [
  { regex: /(?:src|lib|app|components|pages)\/[\w\-/]+\.\w+/g, type: 'path' },
  { regex: /(?:src|lib|app|components|pages)\/[\w\-/]+/g, type: 'directory' },
  {
    regex: /\b[a-z][a-zA-Z0-9]*(?:Component|Hook|Service|Controller|Module)\b/g,
    type: 'name',
  },
  { regex: /:\d{4,5}\b/g, type: 'port' },
  { regex: /https?:\/\/[^\s]+/g, type: 'url' },
];

export class ParameterExtractor {
  extract(steps: DistilledStep[], existingParams: SkillParameter[]): ExtractResult {
    const extractedParams = new Map<string, SkillParameter>();

    existingParams.forEach((p) => {
      extractedParams.set(p.name, {
        ...p,
        required: p.default === undefined,
      });
    });

    const processedSteps: SkillStep[] = steps
      .filter((s) => s.isKeyStep)
      .map((step) => {
        let description = step.description;

        for (const pattern of PATTERNS) {
          const matches = description.match(pattern.regex);
          if (matches) {
            for (const match of matches) {
              const paramName = this.generateParamName(match, pattern.type);

              if (!extractedParams.has(paramName)) {
                extractedParams.set(paramName, {
                  name: paramName,
                  type: 'string',
                  description: `${pattern.type} parameter extracted from step`,
                  default: match,
                  required: false,
                });
              }

              description = description.replace(match, `{${paramName}}`);
            }
          }
        }

        return {
          title: step.title,
          description,
          substeps: step.substeps,
        };
      });

    return {
      steps: processedSteps,
      parameters: Array.from(extractedParams.values()),
    };
  }

  private generateParamName(value: string, type: string): string {
    switch (type) {
      case 'path': {
        const fileName = value.split('/').pop() ?? 'file';
        return `${fileName.replace(/\.\w+$/, '')}_path`;
      }
      case 'directory': {
        const dirName = value.split('/').pop() ?? 'dir';
        return `${dirName}_dir`;
      }
      case 'name':
        return value.toLowerCase().replace(/component|hook|service/gi, '') + '_name';
      case 'port':
        return 'port';
      case 'url':
        return 'api_url';
      default:
        return `param_${type}`;
    }
  }
}
