import type { Workflow } from '../types/workflow.js';
import type { WorkflowStep } from '../types/step.js';
import {
  isSkillStep,
  isParallelStep,
  isConditionStep,
  isForeachStep,
  isWhileStep,
  isSubWorkflowStep,
} from '../types/step.js';

interface MermaidOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  theme?: 'default' | 'forest' | 'dark' | 'neutral';
}

function escapeLabel(text: string): string {
  return text.replace(/"/g, '\\"').replace(/\n/g, '<br/>');
}

function getNodeShape(step: WorkflowStep): { prefix: string; suffix: string } {
  if (isParallelStep(step)) {
    return { prefix: '{{', suffix: '}}' };
  }
  if (isConditionStep(step)) {
    return { prefix: '{', suffix: '}' };
  }
  if (isForeachStep(step) || isWhileStep(step)) {
    return { prefix: '([', suffix: '])' };
  }
  if (isSubWorkflowStep(step)) {
    return { prefix: '[[', suffix: ']]' };
  }
  return { prefix: '[', suffix: ']' };
}

function getStepLabel(step: WorkflowStep): string {
  if (isSkillStep(step)) {
    return step.name ?? step.skill;
  }
  if (isParallelStep(step)) {
    return step.name ?? 'parallel';
  }
  if (isConditionStep(step)) {
    return step.name ?? `if: ${step.condition.if.substring(0, 20)}...`;
  }
  if (isForeachStep(step)) {
    return step.name ?? `foreach: ${step.foreach.as}`;
  }
  if (isWhileStep(step)) {
    return step.name ?? `while: ${step.while.condition.substring(0, 20)}...`;
  }
  if (isSubWorkflowStep(step)) {
    return step.name ?? `workflow: ${step.workflow}`;
  }
  return (step as WorkflowStep).id;
}

export function toMermaid(workflow: Workflow, options: MermaidOptions = {}): string {
  const { direction = 'TB' } = options;
  const lines: string[] = [];
  const connections: string[] = [];
  let nodeCounter = 0;

  lines.push(`flowchart ${direction}`);
  lines.push('');

  function generateNodeId(): string {
    return `node${nodeCounter++}`;
  }

  function processStep(step: WorkflowStep, prevNodeId?: string): string {
    const nodeId = step.id.replace(/[^a-zA-Z0-9]/g, '_');
    const label = escapeLabel(getStepLabel(step));
    const { prefix, suffix } = getNodeShape(step);

    lines.push(`    ${nodeId}${prefix}"${label}"${suffix}`);

    if (prevNodeId) {
      connections.push(`    ${prevNodeId} --> ${nodeId}`);
    }

    if (isParallelStep(step)) {
      const joinNodeId = `${nodeId}_join`;
      lines.push(`    ${joinNodeId}((join))`);

      for (const childStep of step.parallel) {
        const childEndId = processStep(childStep, nodeId);
        connections.push(`    ${childEndId} --> ${joinNodeId}`);
      }

      return joinNodeId;
    }

    if (isConditionStep(step)) {
      const thenSteps = Array.isArray(step.condition.then)
        ? step.condition.then
        : [step.condition.then];

      let thenEndId = nodeId;
      for (const childStep of thenSteps) {
        thenEndId = processStep(childStep, thenEndId);
      }

      if (step.condition.else) {
        const elseSteps = Array.isArray(step.condition.else)
          ? step.condition.else
          : [step.condition.else];

        const elseStartId = generateNodeId();
        lines.push(`    ${elseStartId}[else]`);
        connections.push(`    ${nodeId} -->|false| ${elseStartId}`);

        let elseEndId = elseStartId;
        for (const childStep of elseSteps) {
          elseEndId = processStep(childStep, elseEndId);
        }

        const mergeId = `${nodeId}_merge`;
        lines.push(`    ${mergeId}((merge))`);
        connections.push(`    ${thenEndId} --> ${mergeId}`);
        connections.push(`    ${elseEndId} --> ${mergeId}`);

        connections.push(
          `    ${nodeId} -->|true| ${thenSteps[0]!.id.replace(/[^a-zA-Z0-9]/g, '_')}`
        );
        return mergeId;
      }

      connections.push(`    ${nodeId} -->|true| ${thenSteps[0]!.id.replace(/[^a-zA-Z0-9]/g, '_')}`);
      return thenEndId;
    }

    if (isForeachStep(step)) {
      const loopSteps = Array.isArray(step.foreach.step) ? step.foreach.step : [step.foreach.step];

      let lastId = nodeId;
      for (const childStep of loopSteps) {
        lastId = processStep(childStep, lastId);
      }

      connections.push(`    ${lastId} -.->|next item| ${nodeId}`);

      const exitId = `${nodeId}_exit`;
      lines.push(`    ${exitId}((done))`);
      connections.push(`    ${nodeId} -->|complete| ${exitId}`);
      return exitId;
    }

    if (isWhileStep(step)) {
      const loopSteps = Array.isArray(step.while.step) ? step.while.step : [step.while.step];

      let lastId = nodeId;
      for (const childStep of loopSteps) {
        lastId = processStep(childStep, lastId);
      }

      connections.push(`    ${lastId} -.->|loop| ${nodeId}`);

      const exitId = `${nodeId}_exit`;
      lines.push(`    ${exitId}((done))`);
      connections.push(`    ${nodeId} -->|false| ${exitId}`);
      return exitId;
    }

    if (isSubWorkflowStep(step)) {
      const subgraphId = `subgraph_${nodeId}`;
      lines.push(`    subgraph ${subgraphId}["${step.workflow}"]`);
      lines.push(`        ${nodeId}_start[Start]`);
      lines.push(`        ${nodeId}_end[End]`);
      lines.push(`        ${nodeId}_start --> ${nodeId}_end`);
      lines.push(`    end`);
    }

    return nodeId;
  }

  let prevId: string | undefined;
  for (const step of workflow.steps) {
    prevId = processStep(step, prevId);
  }

  lines.push('');
  lines.push(...connections);

  return lines.join('\n');
}

export function toMermaidWithStyles(workflow: Workflow, options: MermaidOptions = {}): string {
  const base = toMermaid(workflow, options);
  const styles = `
    classDef skill fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef parallel fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef condition fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef loop fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef subworkflow fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
  `;

  return base + '\n' + styles;
}
