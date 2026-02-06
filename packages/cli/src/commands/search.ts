import type { Command } from 'commander';
import chalk from 'chalk';

// GitHub-based search (website registry not yet available)
const GITHUB_SEARCH_BASE = 'https://github.com/search';
const GITHUB_TOPICS_BASE = 'https://github.com/topics';
const SKILL_TOPIC = 'skillbolt';

export function buildSearchUrl(query?: string): string {
  if (!query) {
    return `${GITHUB_TOPICS_BASE}/${SKILL_TOPIC}`;
  }
  const params = new URLSearchParams({
    q: `${query} topic:${SKILL_TOPIC}`,
    type: 'repositories',
  });
  return `${GITHUB_SEARCH_BASE}?${params.toString()}`;
}

async function openInBrowser(url: string): Promise<void> {
  const open = (await import('open')).default;
  await open(url);
}

export function registerSearchCommand(program: Command): void {
  program
    .command('search [query]')
    .description('Search for skills on GitHub')
    .option('-n, --no-browser', 'Only display URL without opening browser')
    .option('-w, --web', 'Open skill topics page directly')
    .action(async (query: string | undefined, options: { browser: boolean; web: boolean }) => {
      try {
        const url = buildSearchUrl(options.web ? undefined : query);

        console.log(chalk.cyan('\nSkillbolt - Search Skills on GitHub'));
        console.log(chalk.gray('-'.repeat(40)));

        if (query && !options.web) {
          console.log(chalk.white(`Searching for: "${query}"`));
        }

        console.log(chalk.white(`URL: ${chalk.underline(url)}`));

        if (options.browser !== false) {
          console.log(chalk.gray('\nOpening in browser...'));
          await openInBrowser(url);
          console.log(chalk.green('✓'), 'Browser opened successfully');
        } else {
          console.log(chalk.yellow('\nTip: Remove --no-browser to open automatically'));
        }

        console.log();
      } catch (error) {
        console.error(chalk.red('✗'), `Failed to open browser: ${(error as Error).message}`);
        console.log(chalk.gray(`\nYou can manually visit: ${buildSearchUrl(query)}`));
        process.exit(1);
      }
    });
}
