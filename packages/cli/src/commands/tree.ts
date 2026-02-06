import type { Command } from 'commander';
import chalk from 'chalk';
import { loadPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface TreeBuildResult {
  tree: unknown; // 因无导入，TreeNodeData 暂用 unknown 保持最小修改（也可写 any）
  totalSkills: number;
  totalNodes: number;
  maxDepth: number;
  llmCalls: number;
  duration: number;
  outputPath: string;
  htmlPath?: string;
}

interface TreeModule {
  TreeBuilder: new (options: {
    skillsDir: string;
    outputPath: string;
    llm?: unknown;
    config?: unknown;
    maxWorkers?: number;
    onProgress?: (p: unknown) => void;
  }) => {
    build(options: {
      generateHtml?: boolean;
      onProgress?: (p: unknown) => void;
    }): Promise<TreeBuildResult>;
  };
  createTreeConfig: (options?: Record<string, unknown>) => unknown;
  loadTree: (path: string) => Promise<TreeNodeLike>;
  renderTreeASCII: (node: TreeNodeLike) => string;
  saveTreeToJSON: (node: TreeNodeLike, path: string) => Promise<void>;
  saveTreeToHTML: (node: TreeNodeLike, path: string) => Promise<void>;
  getTreeStats: (node: TreeNodeLike) => { totalNodes: number; totalSkills: number; maxDepth: number };
}

interface TreeNodeLike {
  name: string;
  countAllSkills(): number;
}

interface CoreModule {
  createLLMAdapter: (options?: Record<string, unknown>) => unknown;
}

export function registerTreeCommand(program: Command): void {
  const tree = program.command('tree').description('Capability tree operations');

  tree
    .command('build')
    .description('Build capability tree from skill directory')
    .option('-d, --dir <path>', 'Skill directory', '.claude/skills')
    .option('-o, --output <path>', 'Output tree file path', 'tree.yaml')
    .option('-g, --group <name>', 'Skill group to use')
    .option('--model <model>', 'LLM model to use')
    .option('--max-workers <n>', 'Max concurrent workers', '4')
    .option('--no-html', 'Skip HTML visualization output')
    .option('-v, --verbose', 'Show detailed progress', false)
    .action(async (options) => {
      const treeResult = await loadPackage<TreeModule>('@skillbolt/tree');
      const coreResult = await loadPackage<CoreModule>('@skillbolt/core');
      if (!treeResult.success || !treeResult.module) {
        return handleMissingPackage('tree');
      }
      if (!coreResult.success || !coreResult.module) {
        return handleMissingPackage('tree');
      }

      try {
        const { TreeBuilder, createTreeConfig } = treeResult.module;
        const { createLLMAdapter } = coreResult.module;

        const llm = createLLMAdapter(options.model ? { model: options.model } : undefined);
        const config = createTreeConfig({ maxWorkers: parseInt(options.maxWorkers, 10) });
        const builder = new TreeBuilder({
          llm,
          config,
          skillsDir: options.dir,
          outputPath: options.output
        });

        console.log(chalk.cyan('\n  Building capability tree...'));
        console.log(chalk.gray(`  Skill directory: ${options.dir}`));
        console.log(chalk.gray(`  Output: ${options.output}\n`));

        const result = await builder.build({
          generateHtml: options.html !== false,
          onProgress: options.verbose
            ? (progress: unknown) => {
              const p = progress as { phase?: string; message?: string };
              console.log(chalk.gray(`  [${p.phase || ''}] ${p.message || ''}`));
            }
            : undefined,
        });
        
        // const root = result as unknown as TreeNodeLike;
        // const stats = getTreeStats(root);
        // const stats = root.getTreeStats();
        console.log(chalk.green('\n  Tree built successfully'));
        console.log(
          chalk.gray(
            `  Nodes: ${result.totalNodes}, Skills: ${result.totalSkills}, Depth: ${result.maxDepth}`
          )
        );

        console.log('');
      } catch (error) {
        handleError(error);
      }
    });

  tree
    .command('show')
    .description('Display capability tree')
    .option('-f, --format <format>', 'Output format (ascii, json, html)', 'ascii')
    .option('-g, --group <name>', 'Skill group')
    .option('-p, --path <path>', 'Tree file path', 'tree.yaml')
    .option('--stats', 'Show tree statistics', false)
    .action(async (options) => {
      const treeResult = await loadPackage<TreeModule>('@skillbolt/tree');
      if (!treeResult.success || !treeResult.module) {
        return handleMissingPackage('tree');
      }

      try {
        const { loadTree, renderTreeASCII, getTreeStats } = treeResult.module;
        const root = await loadTree(options.path);

        if (options.stats) {
          const stats = getTreeStats(root);
          console.log(chalk.cyan('\n  Tree Statistics'));
          console.log(chalk.gray(`  Nodes: ${stats.totalNodes}`));
          console.log(chalk.gray(`  Skills: ${stats.totalSkills}`));
          console.log(chalk.gray(`  Depth: ${stats.maxDepth}\n`));
          return;
        }

        if (options.format === 'ascii') {
          console.log(renderTreeASCII(root));
        } else if (options.format === 'json') {
          console.log(JSON.stringify(root, null, 2));
        }
      } catch (error) {
        handleError(error);
      }
    });

  tree
    .command('stats')
    .description('Show capability tree statistics')
    .option('-p, --path <path>', 'Tree file path', 'tree.yaml')
    .action(async (options) => {
      const treeResult = await loadPackage<TreeModule>('@skillbolt/tree');
      if (!treeResult.success || !treeResult.module) {
        return handleMissingPackage('tree');
      }

      try {
        const { loadTree, getTreeStats } = treeResult.module;
        const root = await loadTree(options.path);
        const stats = getTreeStats(root);

        console.log(chalk.cyan('\n  Capability Tree Statistics\n'));
        console.log(`  ${chalk.gray('Total Nodes:')}   ${stats.totalNodes}`);
        console.log(`  ${chalk.gray('Total Skills:')}  ${stats.totalSkills}`);
        console.log(`  ${chalk.gray('Tree Depth:')}    ${stats.maxDepth}`);
        console.log('');
      } catch (error) {
        handleError(error);
      }
    });
}
