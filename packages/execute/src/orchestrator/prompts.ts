import type { SkillNode } from '@skillbolt/compose';
import { NodeStatus } from '@skillbolt/compose';

export const EXECUTOR_PROMPT = `You are executing a skill as part of a larger workflow.

## Instructions
1. Use the Skill tool to invoke the specified skill
2. Pass the purpose and context to the skill
3. Save all outputs to the specified output directory
4. Use dependency outputs if available

## Important
- Use the Skill tool with the skill name, do NOT try to execute the skill manually
- The Skill tool will load and execute the skill's instructions automatically
- **Always use absolute paths** when referencing or passing file paths
- **You MUST operate within your designated working directory**
`;

export const DIRECT_EXECUTOR_PROMPT = `You are completing a task directly using available tools.

## Instructions
1. Analyze the task requirements carefully
2. Use available tools (Bash, Read, Write, Edit, Glob, Grep) to complete the task
3. Save all outputs to the specified output directory
4. Use absolute paths when referencing files

## Task
{task}

## Working Directory
{workingDir}

## Output Directory
Save all generated files to: {outputDir}

After completing the task, provide a summary in this format:
<execution_summary>
STATUS: SUCCESS or FAILURE
1. What was accomplished
2. Key output files created
3. Any notes or recommendations
</execution_summary>
`;

interface IsolatedExecutorPromptOptions {
  overallTask: string;
  workingDir: string;
  skillName: string;
  nodePurpose: string;
  outputDir: string;
  outputsSummary: string;
  downstreamHint: string;
  artifactsContext: string;
}

interface DirectExecutorPromptOptions {
  task: string;
  workingDir: string;
  outputDir: string;
}

interface ArtifactsContextOptions {
  nodes: Map<string, SkillNode>;
  nodeId: string;
}

export const buildIsolatedExecutorPrompt = (options: IsolatedExecutorPromptOptions): string => {
  const {
    overallTask,
    workingDir,
    skillName,
    nodePurpose,
    outputDir,
    outputsSummary,
    downstreamHint,
    artifactsContext,
  } = options;

  return `${EXECUTOR_PROMPT}

## Overall Task
${overallTask}

## Working Directory
Your working directory is: ${workingDir}
**IMPORTANT**: All file operations MUST be performed within this directory or its subdirectories.

## Current Step
Invoke the '${skillName}' skill to accomplish: ${nodePurpose}

## Output Directory
Save all generated files to: ${outputDir}

## Available Artifacts & How to Use Them
${artifactsContext}

## Expected Outputs
${outputsSummary}

## Downstream Usage
${downstreamHint}

Now use the Skill tool to invoke '${skillName}'.

After completing the task, provide a summary in this format:
<execution_summary>
STATUS: SUCCESS or FAILURE
1. What was accomplished (or what went wrong if failed)
2. Key output files created
3. Important notes for downstream nodes
</execution_summary>
`;
};

export const buildDirectExecutorPrompt = (options: DirectExecutorPromptOptions): string => {
  const { task, workingDir, outputDir } = options;
  return DIRECT_EXECUTOR_PROMPT.replace('{task}', task)
    .replace('{workingDir}', workingDir)
    .replace('{outputDir}', outputDir);
};

export const buildArtifactsContext = (options: ArtifactsContextOptions): string => {
  const { nodes, nodeId } = options;
  const target = nodes.get(nodeId);
  if (!target) {
    return 'None (this is the first node)';
  }

  const artifacts: string[] = [];
  for (const dependencyId of target.dependsOn) {
    const dependency = nodes.get(dependencyId);
    if (!dependency || dependency.status !== NodeStatus.COMPLETED) {
      continue;
    }

    const usageHint = dependency.usageHints[nodeId] ?? 'No usage hint provided.';
    const outputPath = dependency.outputPath ?? 'Unknown';
    artifacts.push(
      `### ${dependency.id} (${dependency.name})\n- Path: ${outputPath}\n- How to use: ${usageHint}`
    );
  }

  if (artifacts.length === 0) {
    return 'None (this is the first node)';
  }

  return artifacts.join('\n\n');
};
