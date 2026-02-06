import type { Rule } from '../../types/index.js';

const REQUIRED_FIELDS = ['name', 'description'];

function extractFrontmatterFields(content: string): Set<string> {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return new Set();

  const frontmatterContent = frontmatterMatch[1] ?? '';
  const fields = new Set<string>();
  const lines = frontmatterContent.split('\n');

  for (const line of lines) {
    const match = line.match(/^(\w+):/);
    if (match && match[1]) {
      fields.add(match[1]);
    }
  }

  return fields;
}

export const frontmatterFields: Rule = {
  meta: {
    id: 'frontmatter-fields',
    description: 'Ensure frontmatter has required fields',
    category: 'format',
    severity: 'error',
    fixable: false,
    docs: {
      recommended: true,
    },
  },
  create(context) {
    return {
      SkillFile(skillFile) {
        const existingFields = extractFrontmatterFields(context.content);
        const manifest = skillFile.manifest;

        for (const field of REQUIRED_FIELDS) {
          if (!existingFields.has(field)) {
            context.report({
              message: `Missing required frontmatter field: "${field}"`,
              line: 1,
              column: 1,
            });
            continue;
          }

          const value = manifest[field as keyof typeof manifest];
          if (typeof value === 'string' && value.trim() === '') {
            context.report({
              message: `Frontmatter field "${field}" is empty`,
              line: 1,
              column: 1,
            });
          }
        }

        if (manifest.version !== undefined) {
          const semverPattern = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;
          if (typeof manifest.version === 'string' && !semverPattern.test(manifest.version)) {
            context.report({
              message: `Invalid version format: "${manifest.version}". Expected semver (e.g., "1.0.0")`,
              line: 1,
              column: 1,
            });
          }
        }

        if (manifest.triggers !== undefined && !Array.isArray(manifest.triggers)) {
          context.report({
            message: 'Field "triggers" must be an array',
            line: 1,
            column: 1,
          });
        }
      },
    };
  },
};
