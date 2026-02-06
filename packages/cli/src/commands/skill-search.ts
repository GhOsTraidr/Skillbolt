import type { Command } from 'commander';
import chalk from 'chalk';
import { loadPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface SearchModule {
  Searcher: new (options: { llm: unknown; tree: unknown; config?: unknown }) => {
    search(query: string, options?: Record<string, unknown>): Promise<SearchResultLike>;
  };
  createSearchConfig: (options?: Record<string, unknown>) => unknown;
}

interface TreeModule {
  loadTree: (path: string) => Promise<unknown>;
}

interface CoreModule {
  createLLMAdapter: (options?: Record<string, unknown>) => unknown;
}

interface SearchResultLike {
  selectedSkills: Array<{ name: string; description: string; relevanceReason?: string }>;
  llmCalls: number;
}

export function registerSkillSearchCommand(program: Command): void {
  program
    .command('skill-search <query>')
    .description('Search for task-relevant skills using LLM-powered tree traversal')
    .option('-g, --group <name>', 'Skill group to search')
    .option('-p, --tree-path <path>', 'Capability tree file path', 'tree.yaml')
    .option('-n, --max-skills <n>', 'Maximum skills to return', '10')
    .option('--no-prune', 'Disable result pruning')
    .option('--model <model>', 'LLM model to use')
    .option('-v, --verbose', 'Show search progress', false)
    .option('--json', 'Output as JSON', false)
    .action(async (query: string, options) => {
      const searchResult = await loadPackage<SearchModule>('@skillbolt/search');
      const treeResult = await loadPackage<TreeModule>('@skillbolt/tree');
      const coreResult = await loadPackage<CoreModule>('@skillbolt/core');

      if (!searchResult.success || !searchResult.module) {
        return handleMissingPackage('skill-search');
      }
      if (!treeResult.success || !treeResult.module) {
        return handleMissingPackage('skill-search');
      }
      if (!coreResult.success || !coreResult.module) {
        return handleMissingPackage('skill-search');
      }

      try {
        const { Searcher, createSearchConfig } = searchResult.module;
        const { loadTree } = treeResult.module;
        const { createLLMAdapter } = coreResult.module;

        const llm = createLLMAdapter(options.model ? { model: options.model } : undefined);
        const tree = await loadTree(options.treePath);
        const config = createSearchConfig({ maxSkills: parseInt(options.maxSkills, 10) });
        const searcher = new Searcher({ llm, tree, config });

        if (!options.json) {
          console.log(chalk.cyan(`\n  Searching: "${query}"\n`));
        }

        const result = await searcher.search(query);

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        if (result.selectedSkills.length === 0) {
          console.log(chalk.yellow('  No relevant skills found.\n'));
          return;
        }

        console.log(
          chalk.green(
            `  Found ${result.selectedSkills.length} skills (${result.llmCalls} LLM calls)\n`
          )
        );

        for (const skill of result.selectedSkills) {
          console.log(`  ${chalk.cyan('-')} ${chalk.bold(skill.name)}`);
          if (skill.description) console.log(`    ${chalk.gray(skill.description)}`);
          if (skill.relevanceReason) console.log(`    ${chalk.italic.gray(skill.relevanceReason)}`);
          console.log('');
        }
      } catch (error) {
        handleError(error);
      }
    });
}
