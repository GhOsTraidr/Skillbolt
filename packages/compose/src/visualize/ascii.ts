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

interface BoxOptions {
  width?: number;
  padding?: number;
}

const BOX_CHARS = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  teeDown: '┬',
  teeUp: '┴',
  teeRight: '├',
  teeLeft: '┤',
  cross: '┼',
};

function createBox(text: string, options: BoxOptions = {}): string[] {
  const { width = Math.max(text.length + 4, 12), padding = 1 } = options;
  const innerWidth = width - 2;
  const paddedText = text.padStart((innerWidth + text.length) / 2).padEnd(innerWidth);

  const lines: string[] = [];
  lines.push(`${BOX_CHARS.topLeft}${BOX_CHARS.horizontal.repeat(innerWidth)}${BOX_CHARS.topRight}`);

  for (let i = 0; i < padding; i++) {
    lines.push(`${BOX_CHARS.vertical}${' '.repeat(innerWidth)}${BOX_CHARS.vertical}`);
  }

  lines.push(`${BOX_CHARS.vertical}${paddedText}${BOX_CHARS.vertical}`);

  for (let i = 0; i < padding; i++) {
    lines.push(`${BOX_CHARS.vertical}${' '.repeat(innerWidth)}${BOX_CHARS.vertical}`);
  }

  lines.push(
    `${BOX_CHARS.bottomLeft}${BOX_CHARS.horizontal.repeat(innerWidth)}${BOX_CHARS.bottomRight}`
  );

  return lines;
}

function getStepLabel(step: WorkflowStep): string {
  if (isSkillStep(step)) {
    return step.name ?? step.skill;
  }
  if (isParallelStep(step)) {
    return step.name ?? 'parallel';
  }
  if (isConditionStep(step)) {
    return step.name ?? 'if';
  }
  if (isForeachStep(step)) {
    return step.name ?? 'foreach';
  }
  if (isWhileStep(step)) {
    return step.name ?? 'while';
  }
  if (isSubWorkflowStep(step)) {
    return step.name ?? `workflow:${step.workflow}`;
  }
  return (step as WorkflowStep).id;
}

function getStepType(step: WorkflowStep): string {
  if (isSkillStep(step)) return 'skill';
  if (isParallelStep(step)) return 'parallel';
  if (isConditionStep(step)) return 'condition';
  if (isForeachStep(step)) return 'foreach';
  if (isWhileStep(step)) return 'while';
  if (isSubWorkflowStep(step)) return 'subworkflow';
  return 'unknown';
}

interface VisualNode {
  id: string;
  label: string;
  type: string;
  width: number;
  children?: VisualNode[];
  branches?: { condition: string; nodes: VisualNode[] }[];
}

function buildVisualTree(steps: WorkflowStep[]): VisualNode[] {
  return steps.map((step) => {
    const node: VisualNode = {
      id: step.id,
      label: getStepLabel(step),
      type: getStepType(step),
      width: Math.max(getStepLabel(step).length + 4, 12),
    };

    if (isParallelStep(step)) {
      node.children = buildVisualTree(step.parallel);
    } else if (isConditionStep(step)) {
      const thenSteps = Array.isArray(step.condition.then)
        ? step.condition.then
        : [step.condition.then];
      const elseSteps = step.condition.else
        ? Array.isArray(step.condition.else)
          ? step.condition.else
          : [step.condition.else]
        : [];

      node.branches = [{ condition: 'true', nodes: buildVisualTree(thenSteps) }];
      if (elseSteps.length > 0) {
        node.branches.push({ condition: 'false', nodes: buildVisualTree(elseSteps) });
      }
    } else if (isForeachStep(step)) {
      const loopSteps = Array.isArray(step.foreach.step) ? step.foreach.step : [step.foreach.step];
      node.children = buildVisualTree(loopSteps);
    } else if (isWhileStep(step)) {
      const loopSteps = Array.isArray(step.while.step) ? step.while.step : [step.while.step];
      node.children = buildVisualTree(loopSteps);
    }

    return node;
  });
}

function renderSequentialNodes(nodes: VisualNode[], indent: number = 0): string[] {
  const lines: string[] = [];
  const indentStr = ' '.repeat(indent);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const box = createBox(node.label, { width: node.width, padding: 0 });

    for (const line of box) {
      lines.push(indentStr + line);
    }

    if (node.children && node.children.length > 0) {
      if (node.type === 'parallel') {
        lines.push(indentStr + centerText('│', node.width));
        lines.push(indentStr + centerText('┬', node.width));

        const childLines = renderParallelNodes(node.children, node.width);
        for (const line of childLines) {
          lines.push(indentStr + line);
        }

        lines.push(indentStr + centerText('┴', node.width));
      } else {
        lines.push(indentStr + centerText('│', node.width));
        const childLines = renderSequentialNodes(node.children, indent + 2);
        lines.push(...childLines);
      }
    }

    if (node.branches && node.branches.length > 0) {
      lines.push(indentStr + centerText('│', node.width));
      const branchLines = renderBranches(node.branches, node.width);
      for (const line of branchLines) {
        lines.push(indentStr + line);
      }
    }

    if (i < nodes.length - 1) {
      lines.push(indentStr + centerText('│', node.width));
      lines.push(indentStr + centerText('▼', node.width));
    }
  }

  return lines;
}

function renderParallelNodes(nodes: VisualNode[], parentWidth: number): string[] {
  const nodeWidths = nodes.map((n) => n.width);
  const totalWidth = nodeWidths.reduce((sum, w) => sum + w, 0) + (nodes.length - 1) * 3;
  const startOffset = Math.max(0, Math.floor((parentWidth - totalWidth) / 2));

  const renderedNodes = nodes.map((node) => {
    const box = createBox(node.label, { width: node.width, padding: 0 });
    return box;
  });

  const maxHeight = Math.max(...renderedNodes.map((r) => r.length));
  const lines: string[] = [];

  let connectorLine = ' '.repeat(startOffset);
  let positions: number[] = [];
  let currentPos = startOffset;

  for (let i = 0; i < nodes.length; i++) {
    const nodeWidth = nodeWidths[i]!;
    const center = currentPos + Math.floor(nodeWidth / 2);
    positions.push(center);

    if (i === 0) {
      connectorLine += '┌' + '─'.repeat(nodeWidth - 1);
    } else if (i === nodes.length - 1) {
      connectorLine += '─'.repeat(Math.floor(nodeWidth / 2)) + '┐';
    } else {
      connectorLine +=
        '─'.repeat(Math.floor(nodeWidth / 2)) + '┬' + '─'.repeat(Math.floor(nodeWidth / 2));
    }

    if (i < nodes.length - 1) {
      connectorLine += '─';
      currentPos += nodeWidth + 3;
    }
  }

  lines.push(connectorLine);

  let verticalLine = ' '.repeat(startOffset);
  currentPos = startOffset;
  for (let i = 0; i < nodes.length; i++) {
    const nodeWidth = nodeWidths[i]!;
    verticalLine += centerText('│', nodeWidth);
    if (i < nodes.length - 1) {
      verticalLine += '   ';
      currentPos += nodeWidth + 3;
    }
  }
  lines.push(verticalLine);

  for (let row = 0; row < maxHeight; row++) {
    let line = ' '.repeat(startOffset);
    for (let i = 0; i < nodes.length; i++) {
      const rendered = renderedNodes[i]!;
      if (row < rendered.length) {
        line += rendered[row];
      } else {
        line += ' '.repeat(nodeWidths[i]!);
      }
      if (i < nodes.length - 1) {
        line += '   ';
      }
    }
    lines.push(line);
  }

  let bottomConnector = ' '.repeat(startOffset);
  for (let i = 0; i < nodes.length; i++) {
    const nodeWidth = nodeWidths[i]!;
    bottomConnector += centerText('│', nodeWidth);
    if (i < nodes.length - 1) {
      bottomConnector += '   ';
    }
  }
  lines.push(bottomConnector);

  let mergeConnector = ' '.repeat(startOffset);
  for (let i = 0; i < nodes.length; i++) {
    const nodeWidth = nodeWidths[i]!;
    if (i === 0) {
      mergeConnector += '└' + '─'.repeat(nodeWidth - 1);
    } else if (i === nodes.length - 1) {
      mergeConnector += '─'.repeat(Math.floor(nodeWidth / 2)) + '┘';
    } else {
      mergeConnector +=
        '─'.repeat(Math.floor(nodeWidth / 2)) + '┴' + '─'.repeat(Math.floor(nodeWidth / 2));
    }
    if (i < nodes.length - 1) {
      mergeConnector += '─';
    }
  }
  lines.push(mergeConnector);

  return lines;
}

function renderBranches(
  branches: { condition: string; nodes: VisualNode[] }[],
  parentWidth: number
): string[] {
  const lines: string[] = [];

  if (branches.length === 1) {
    const branch = branches[0]!;
    lines.push(centerText(`[${branch.condition}]`, parentWidth));
    lines.push(centerText('│', parentWidth));
    const childLines = renderSequentialNodes(branch.nodes, 0);
    for (const line of childLines) {
      lines.push(centerText(line.trim(), parentWidth));
    }
  } else if (branches.length === 2) {
    const leftBranch = branches[0]!;
    const rightBranch = branches[1]!;

    lines.push(centerText('┬', parentWidth));

    const leftLabel = `[${leftBranch.condition}]`;
    const rightLabel = `[${rightBranch.condition}]`;

    const spacing = Math.max(parentWidth, 20);
    lines.push(leftLabel.padEnd(spacing / 2) + rightLabel);

    const leftLines = renderSequentialNodes(leftBranch.nodes, 0);
    const rightLines = renderSequentialNodes(rightBranch.nodes, 0);

    const maxHeight = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxHeight; i++) {
      const leftLine = i < leftLines.length ? leftLines[i]! : '';
      const rightLine = i < rightLines.length ? rightLines[i]! : '';
      lines.push(leftLine.padEnd(spacing / 2) + rightLine);
    }

    lines.push(centerText('┴', parentWidth));
  }

  return lines;
}

function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

export function toAscii(workflow: Workflow): string {
  const lines: string[] = [];

  lines.push(`Workflow: ${workflow.name}`);
  if (workflow.description) {
    lines.push(`Description: ${workflow.description}`);
  }
  if (workflow.version) {
    lines.push(`Version: ${workflow.version}`);
  }
  lines.push('');
  lines.push('─'.repeat(40));
  lines.push('');

  const tree = buildVisualTree(workflow.steps);
  const rendered = renderSequentialNodes(tree);
  lines.push(...rendered);

  lines.push('');
  lines.push('─'.repeat(40));

  return lines.join('\n');
}

export function toSimpleAscii(workflow: Workflow): string {
  const lines: string[] = [];

  lines.push(`[${workflow.name}]`);
  lines.push('');

  function renderStep(step: WorkflowStep, indent: number): void {
    const prefix = '  '.repeat(indent);
    const label = getStepLabel(step);
    const type = getStepType(step);

    if (type === 'parallel') {
      lines.push(`${prefix}├─ ${step.id}: parallel`);
      const parallelStep = step as import('../types/step.js').ParallelStep;
      for (const child of parallelStep.parallel) {
        renderStep(child, indent + 1);
      }
    } else if (type === 'condition') {
      const condStep = step as import('../types/step.js').ConditionStep;
      lines.push(`${prefix}├─ ${step.id}: if (${condStep.condition.if})`);
      const thenSteps = Array.isArray(condStep.condition.then)
        ? condStep.condition.then
        : [condStep.condition.then];
      lines.push(`${prefix}│  then:`);
      for (const child of thenSteps) {
        renderStep(child, indent + 2);
      }
      if (condStep.condition.else) {
        const elseSteps = Array.isArray(condStep.condition.else)
          ? condStep.condition.else
          : [condStep.condition.else];
        lines.push(`${prefix}│  else:`);
        for (const child of elseSteps) {
          renderStep(child, indent + 2);
        }
      }
    } else if (type === 'foreach') {
      const foreachStep = step as import('../types/step.js').ForeachStep;
      lines.push(
        `${prefix}├─ ${step.id}: foreach (${foreachStep.foreach.as} in ${foreachStep.foreach.items})`
      );
      const loopSteps = Array.isArray(foreachStep.foreach.step)
        ? foreachStep.foreach.step
        : [foreachStep.foreach.step];
      for (const child of loopSteps) {
        renderStep(child, indent + 1);
      }
    } else if (type === 'while') {
      const whileStep = step as import('../types/step.js').WhileStep;
      lines.push(`${prefix}├─ ${step.id}: while (${whileStep.while.condition})`);
      const loopSteps = Array.isArray(whileStep.while.step)
        ? whileStep.while.step
        : [whileStep.while.step];
      for (const child of loopSteps) {
        renderStep(child, indent + 1);
      }
    } else {
      lines.push(`${prefix}├─ ${step.id}: ${label}`);
    }
  }

  for (const step of workflow.steps) {
    renderStep(step, 0);
  }

  return lines.join('\n');
}
