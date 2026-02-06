import { describe, it, expect } from 'vitest';
import { toAscii, toSimpleAscii, toMermaid } from '../src/index.js';
import type { Workflow } from '../src/index.js';

describe('ASCII Visualization', () => {
  it('should render simple workflow', () => {
    const workflow: Workflow = {
      name: 'simple',
      description: 'A simple workflow',
      steps: [
        { id: 'step1', skill: 'skill1' },
        { id: 'step2', skill: 'skill2' },
      ],
    };

    const ascii = toAscii(workflow);
    expect(ascii).toContain('simple');
    expect(ascii).toContain('skill1');
    expect(ascii).toContain('skill2');
  });

  it('should render parallel steps', () => {
    const workflow: Workflow = {
      name: 'parallel-test',
      steps: [
        {
          id: 'parallel',
          parallel: [
            { id: 'p1', skill: 'task1' },
            { id: 'p2', skill: 'task2' },
          ],
        },
      ],
    };

    const ascii = toAscii(workflow);
    expect(ascii).toContain('parallel');
  });

  it('should render simple ASCII format', () => {
    const workflow: Workflow = {
      name: 'tree-test',
      steps: [
        { id: 'step1', skill: 'skill1' },
        {
          id: 'parallel',
          parallel: [
            { id: 'p1', skill: 'task1' },
            { id: 'p2', skill: 'task2' },
          ],
        },
        {
          id: 'check',
          condition: {
            if: '${step1.result}',
            then: { id: 'yes', skill: 'yes-skill' },
          },
        },
      ],
    };

    const simple = toSimpleAscii(workflow);
    expect(simple).toContain('[tree-test]');
    expect(simple).toContain('step1');
    expect(simple).toContain('parallel');
    expect(simple).toContain('if');
  });

  it('should render foreach loops', () => {
    const workflow: Workflow = {
      name: 'foreach-test',
      steps: [
        {
          id: 'loop',
          foreach: {
            items: '${inputs.items}',
            as: 'item',
            step: { id: 'process', skill: 'processor' },
          },
        },
      ],
    };

    const simple = toSimpleAscii(workflow);
    expect(simple).toContain('foreach');
    expect(simple).toContain('item');
  });
});

describe('Mermaid Visualization', () => {
  it('should generate valid mermaid syntax', () => {
    const workflow: Workflow = {
      name: 'mermaid-test',
      steps: [
        { id: 'step1', skill: 'skill1' },
        { id: 'step2', skill: 'skill2' },
      ],
    };

    const mermaid = toMermaid(workflow);
    expect(mermaid).toContain('flowchart TB');
    expect(mermaid).toContain('step1');
    expect(mermaid).toContain('step2');
    expect(mermaid).toContain('-->');
  });

  it('should render parallel branches', () => {
    const workflow: Workflow = {
      name: 'parallel-mermaid',
      steps: [
        {
          id: 'parallel',
          parallel: [
            { id: 'p1', skill: 'task1' },
            { id: 'p2', skill: 'task2' },
          ],
        },
      ],
    };

    const mermaid = toMermaid(workflow);
    expect(mermaid).toContain('parallel');
    expect(mermaid).toContain('p1');
    expect(mermaid).toContain('p2');
    expect(mermaid).toContain('join');
  });

  it('should render conditional branches', () => {
    const workflow: Workflow = {
      name: 'condition-mermaid',
      steps: [
        {
          id: 'check',
          condition: {
            if: '${flag}',
            then: { id: 'yes', skill: 'yes-skill' },
            else: { id: 'no', skill: 'no-skill' },
          },
        },
      ],
    };

    const mermaid = toMermaid(workflow);
    expect(mermaid).toContain('check');
    expect(mermaid).toContain('yes');
    expect(mermaid).toContain('no');
    expect(mermaid).toContain('true');
    expect(mermaid).toContain('false');
  });

  it('should render foreach with loop indicator', () => {
    const workflow: Workflow = {
      name: 'foreach-mermaid',
      steps: [
        {
          id: 'loop',
          foreach: {
            items: '${items}',
            as: 'item',
            step: { id: 'process', skill: 'processor' },
          },
        },
      ],
    };

    const mermaid = toMermaid(workflow);
    expect(mermaid).toContain('loop');
    expect(mermaid).toContain('process');
    expect(mermaid).toContain('next item');
  });

  it('should support different directions', () => {
    const workflow: Workflow = {
      name: 'direction-test',
      steps: [{ id: 'step1', skill: 'skill1' }],
    };

    const tbMermaid = toMermaid(workflow, { direction: 'TB' });
    expect(tbMermaid).toContain('flowchart TB');

    const lrMermaid = toMermaid(workflow, { direction: 'LR' });
    expect(lrMermaid).toContain('flowchart LR');
  });
});
