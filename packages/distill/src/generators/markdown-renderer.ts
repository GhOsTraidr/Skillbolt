import type { SkillStep, SkillParameter } from '../types/skill.js';

export class MarkdownRenderer {
  renderTitle(name: string): string {
    return `# ${name}`;
  }

  renderOverview(overview: string): string {
    return `## Overview\n\n${overview}`;
  }

  renderTriggers(triggers: string[]): string {
    const lines = [
      '## When This Skill Applies',
      '',
      "This skill activates when the user's request involves:",
    ];

    triggers.forEach((trigger) => {
      lines.push(`- ${trigger}`);
    });

    return lines.join('\n');
  }

  renderPrerequisites(prerequisites: string[]): string {
    const lines = ['## Prerequisites', ''];

    prerequisites.forEach((prereq) => {
      lines.push(`- ${prereq}`);
    });

    return lines.join('\n');
  }

  renderSteps(steps: SkillStep[]): string {
    const lines = ['## Core Workflow', ''];

    steps.forEach((step, index) => {
      lines.push(`### Step ${index + 1}: ${step.title}`);
      lines.push('');
      lines.push(step.description);

      if (step.substeps?.length) {
        lines.push('');
        step.substeps.forEach((substep, i) => {
          lines.push(`${i + 1}. ${substep}`);
        });
      }

      lines.push('');
    });

    return lines.join('\n').trim();
  }

  renderParameters(parameters: SkillParameter[]): string {
    const lines = [
      '## Parameters',
      '',
      '| Parameter | Type | Default | Description |',
      '|-----------|------|---------|-------------|',
    ];

    parameters.forEach((param) => {
      const defaultVal = param.default !== undefined ? `\`${param.default}\`` : '-';
      const required = param.required ? ' (required)' : '';
      lines.push(
        `| \`${param.name}\` | ${param.type} | ${defaultVal} | ${param.description}${required} |`
      );
    });

    return lines.join('\n');
  }

  renderErrorHandling(errorHandling: Record<string, string>): string {
    const lines = ['## Error Handling', ''];

    Object.entries(errorHandling).forEach(([error, solution]) => {
      lines.push(`- **${error}**: ${solution}`);
    });

    return lines.join('\n');
  }

  renderExamples(examples: string[]): string {
    const lines = ['## Example Usage', ''];

    examples.forEach((example) => {
      lines.push('```');
      lines.push(example);
      lines.push('```');
      lines.push('');
    });

    return lines.join('\n').trim();
  }

  renderReferences(references: string[]): string {
    const lines = ['## Additional Resources', '', '### Reference Files', ''];

    references.forEach((ref) => {
      lines.push(`- **\`${ref}\`**`);
    });

    return lines.join('\n');
  }

  renderNotes(notes: string[]): string {
    const lines = ['## Notes', ''];

    notes.forEach((note) => {
      lines.push(`- ${note}`);
    });

    return lines.join('\n');
  }
}
