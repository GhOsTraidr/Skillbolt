import type { Command } from 'commander';
import { loadCommandPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface DistillModule {
  createSessionLoader: (format: string) => SessionLoader;
  Distiller: new () => {
    distill: (session: Session, options: DistillOptions) => Promise<DistillResult>;
  };
  SkillGenerator: new () => {
    generate: (skill: Skill, options: GenerateOptions) => Promise<GenerateResult>;
  };
}

interface SessionLoader {
  getLatestSession: () => Promise<Session>;
  getSession: (id: string) => Promise<Session>;
  listSessions: () => Promise<SessionInfo[]>;
}

interface Session {
  id: string;
  projectPath: string;
  startTime: string;
  endTime?: string;
  messages: Array<{ role: string; content: string }>;
}

interface SessionInfo {
  id: string;
  startTime: string;
  messageCount: number;
  projectPath: string;
  summary?: string;
}

interface DistillOptions {
  userPrompts?: string[];
  skipFailedFilter?: boolean;
  verbose?: boolean;
}

interface DistillResult {
  skill: Skill;
  metadata: { tokenUsage: { input: number; output: number } };
}

interface Skill {
  metadata: { name: string };
}

interface GenerateOptions {
  outputDir: string;
  overwrite?: boolean;
}

interface GenerateResult {
  skillPath: string;
  validation: { warnings: Array<{ message: string }> };
}

export function registerDistillCommand(program: Command): void {
  const distill = program
    .command('distill')
    .description('Distill AI agent conversations into reusable Skills');

  distill
    .command('run')
    .description('Distill a session into a SKILL.md file')
    .option('-l, --last', 'Use the most recent session')
    .option('-s, --session <id>', 'Specify session ID')
    .option('-p, --prompt <text>', 'Additional prompt for distillation', collectPrompts, [])
    .option('-o, --output <dir>', 'Output directory', process.cwd())
    .option('-f, --format <format>', 'Output format (claude|codex|cursor)', 'claude')
    .option('-v, --verbose', 'Show verbose output')
    .option('--skip-filter', 'Skip failed attempt filtering')
    .option('--overwrite', 'Overwrite existing files')
    .action(
      async (options: {
        last?: boolean;
        session?: string;
        prompt: string[];
        output: string;
        format: string;
        verbose?: boolean;
        skipFilter?: boolean;
        overwrite?: boolean;
      }) => {
        const result = await loadCommandPackage<DistillModule>('distill');
        if (!result.success || !result.module) {
          handleMissingPackage('distill');
        }

        const { createSessionLoader, Distiller, SkillGenerator } = result.module;

        try {
          const loader = createSessionLoader(options.format);
          let session: Session;

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
          const distillResult = await distiller.distill(session, {
            userPrompts: options.prompt,
            skipFailedFilter: options.skipFilter,
            verbose: options.verbose,
          });

          console.log(`Skill distilled: ${distillResult.skill.metadata.name}`);
          console.log(
            `Token usage: ${distillResult.metadata.tokenUsage.input} input, ${distillResult.metadata.tokenUsage.output} output`
          );

          const generator = new SkillGenerator();
          const generated = await generator.generate(distillResult.skill, {
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
          handleError(error);
        }
      }
    );

  distill
    .command('list')
    .description('List available sessions')
    .option('-f, --format <format>', 'Platform format (claude|codex|cursor)', 'claude')
    .option('-n, --limit <number>', 'Limit number of results', '20')
    .action(async (options: { format: string; limit: string }) => {
      const result = await loadCommandPackage<DistillModule>('distill');
      if (!result.success || !result.module) {
        handleMissingPackage('distill');
      }

      try {
        const loader = result.module.createSessionLoader(options.format);
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
        handleError(error);
      }
    });

  distill
    .command('show <session-id>')
    .description('Show details of a specific session')
    .option('-f, --format <format>', 'Platform format (claude|codex|cursor)', 'claude')
    .action(async (sessionId: string, options: { format: string }) => {
      const result = await loadCommandPackage<DistillModule>('distill');
      if (!result.success || !result.module) {
        handleMissingPackage('distill');
      }

      try {
        const loader = result.module.createSessionLoader(options.format);
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
        handleError(error);
      }
    });
}

function collectPrompts(value: string, previous: string[]): string[] {
  return [...previous, value];
}
