#!/usr/bin/env node
import { Command } from 'commander';
import { createSessionLoader } from './loaders/index.js';
import { Distiller } from './core/distiller.js';
import { SkillGenerator } from './generators/skill-generator.js';
import { VERSION } from './index.js';
import type { Platform } from './types/config.js';

const program = new Command();

program
  .name('skill-distill')
  .description('Distill AI agent conversations into reusable Skills')
  .version(VERSION);

program
  .command('distill')
  .description('Distill a session into a SKILL.md file')
  .option('-l, --last', 'Use the most recent session')
  .option('-s, --session <id>', 'Specify session ID')
  .option(
    '-p, --prompt <text>',
    'Additional prompt for distillation',
    (val, prev: string[]) => [...prev, val],
    []
  )
  .option('-o, --output <dir>', 'Output directory', process.cwd())
  .option('-f, --format <format>', 'Output format (claude|codex|cursor)', 'claude')
  .option('-v, --verbose', 'Show verbose output')
  .option('--skip-filter', 'Skip failed attempt filtering')
  .option('--overwrite', 'Overwrite existing files')
  .action(async (options) => {
    try {
      const loader = createSessionLoader(options.format as Platform);

      let session;
      if (options.last) {
        console.log('Loading latest session...');
        session = await loader.getLatestSession();
      } else if (options.session) {
        console.log(`Loading session ${options.session}...`);
        session = await loader.getSession(options.session);
      } else {
        console.error('Error: Please specify --last or --session <id>');
        process.exit(1);
      }

      console.log(`Session loaded: ${session.id} (${session.messages.length} messages)`);

      const distiller = new Distiller();
      const result = await distiller.distill(session, {
        userPrompts: options.prompt,
        skipFailedFilter: options.skipFilter,
        verbose: options.verbose,
      });

      console.log(`Skill distilled: ${result.skill.metadata.name}`);
      console.log(
        `Token usage: ${result.metadata.tokenUsage.input} input, ${result.metadata.tokenUsage.output} output`
      );

      const generator = new SkillGenerator();
      const generated = await generator.generate(result.skill, {
        outputDir: options.output,
        overwrite: options.overwrite,
      });

      console.log(`Generated: ${generated.skillPath}`);

      if (generated.validation.warnings.length > 0) {
        console.log('\nWarnings:');
        generated.validation.warnings.forEach((w) => {
          console.log(`  - ${w.message}`);
        });
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available sessions')
  .option('-f, --format <format>', 'Platform format (claude|codex|cursor)', 'claude')
  .option('-n, --limit <number>', 'Limit number of results', '20')
  .action(async (options) => {
    try {
      const loader = createSessionLoader(options.format as Platform);
      const sessions = await loader.listSessions();
      const limit = parseInt(options.limit, 10);

      console.log(
        `Found ${sessions.length} sessions (showing ${Math.min(limit, sessions.length)}):\n`
      );

      sessions.slice(0, limit).forEach((s) => {
        const date = new Date(s.startTime).toLocaleDateString();
        console.log(`${s.id}`);
        console.log(`  Date: ${date} | Messages: ${s.messageCount}`);
        console.log(`  Project: ${s.projectPath}`);
        if (s.summary) {
          console.log(`  Summary: ${s.summary}`);
        }
        console.log('');
      });
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('show <session-id>')
  .description('Show details of a specific session')
  .option('-f, --format <format>', 'Platform format (claude|codex|cursor)', 'claude')
  .action(async (sessionId, options) => {
    try {
      const loader = createSessionLoader(options.format as Platform);
      const session = await loader.getSession(sessionId);

      console.log(`Session: ${session.id}`);
      console.log(`Project: ${session.projectPath}`);
      console.log(`Start: ${session.startTime}`);
      console.log(`End: ${session.endTime ?? 'N/A'}`);
      console.log(`Messages: ${session.messages.length}`);
      console.log('\n--- First Message ---');
      const firstMsg = session.messages[0];
      if (firstMsg) {
        console.log(
          `[${firstMsg.role}]: ${firstMsg.content.slice(0, 500)}${firstMsg.content.length > 500 ? '...' : ''}`
        );
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
