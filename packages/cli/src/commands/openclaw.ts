import type { Command } from 'commander';
import chalk from 'chalk';
import { loadPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface OpenClawModule {
  detectOpenClaw: () => Promise<{
    installed: boolean;
    version: string | null;
    gatewayRunning: boolean;
    gatewayUrl: string;
    configPath: string | null;
    skillsDir: string | null;
    platform: string;
  }>;
  resolveOpenClawConfig: () => {
    enabled: boolean;
    gatewayUrl: string;
    autoSync: boolean;
    skillsDir: string;
    defaultAgent: string;
    costTracking: boolean;
  };
  pushSkills: (options: Record<string, unknown>) => Promise<{
    pushed: string[];
    skipped: string[];
    converted: string[];
    errors: Array<{ skill: string; error: string }>;
  }>;
  pullSkills: (options: Record<string, unknown>) => Promise<{
    pulled: string[];
    skipped: string[];
    converted: string[];
    errors: Array<{ skill: string; error: string }>;
  }>;
}

export function registerOpenclawCommand(program: Command): void {
  const oc = program
    .command('openclaw')
    .alias('oc')
    .description('OpenClaw integration - manage skills across Skillbolt and OpenClaw');

  oc.command('status')
    .description('Check OpenClaw installation and gateway status')
    .action(async () => {
      const result = await loadPackage<OpenClawModule>('@skillbolt/openclaw');
      if (!result.success || !result.module) {
        return handleMissingPackage('openclaw');
      }

      try {
        const env = await result.module.detectOpenClaw();

        console.log(chalk.cyan('\n  OpenClaw Status\n'));

        const row = (label: string, value: string, ok: boolean) => {
          const icon = ok ? chalk.green('✓') : chalk.red('✗');
          console.log(`  ${icon} ${chalk.gray(label.padEnd(18))} ${value}`);
        };

        row('Installed', env.installed ? `Yes (${env.version})` : 'No', env.installed);
        row('Gateway', env.gatewayRunning ? `Running (${env.gatewayUrl})` : 'Not running', env.gatewayRunning);
        row('Config', env.configPath ?? 'Not found', !!env.configPath);
        row('Skills Dir', env.skillsDir ?? 'Not found', !!env.skillsDir);
        row('Platform', env.platform, true);

        const config = result.module.resolveOpenClawConfig();
        console.log(chalk.cyan('\n  Integration Config\n'));
        console.log(chalk.gray(`  Enabled:       ${config.enabled}`));
        console.log(chalk.gray(`  Auto-sync:     ${config.autoSync}`));
        console.log(chalk.gray(`  Default Agent: ${config.defaultAgent}`));
        console.log(chalk.gray(`  Cost Tracking: ${config.costTracking}`));
        console.log('');
      } catch (error) {
        handleError(error);
      }
    });

  oc.command('push [skills...]')
    .description('Push skills to OpenClaw workspace')
    .option('--all', 'Push all skills', false)
    .option('--no-convert', 'Skip format conversion')
    .option('--overwrite', 'Overwrite existing skills', false)
    .option('--dry-run', 'Preview without copying', false)
    .option('-s, --source <dir>', 'Source skills directory', '.claude/skills')
    .option('-t, --target <dir>', 'Target OpenClaw skills directory')
    .action(async (skills: string[], options) => {
      const result = await loadPackage<OpenClawModule>('@skillbolt/openclaw');
      if (!result.success || !result.module) {
        return handleMissingPackage('openclaw');
      }

      try {
        console.log(chalk.cyan('\n  Pushing skills to OpenClaw...\n'));

        const pushResult = await result.module.pushSkills({
          skills: skills.length > 0 ? skills : undefined,
          sourceDir: options.source,
          targetDir: options.target,
          convert: options.convert !== false,
          overwrite: options.overwrite,
          dryRun: options.dryRun,
        });

        if (options.dryRun) {
          console.log(chalk.yellow('  [DRY RUN] No files were copied.\n'));
        }

        if (pushResult.pushed.length > 0) {
          console.log(chalk.green(`  Pushed: ${pushResult.pushed.length}`));
          pushResult.pushed.forEach((s) => console.log(chalk.gray(`    + ${s}`)));
        }
        if (pushResult.skipped.length > 0) {
          console.log(chalk.yellow(`  Skipped: ${pushResult.skipped.length} (already exist)`));
        }
        if (pushResult.converted.length > 0) {
          console.log(chalk.blue(`  Converted: ${pushResult.converted.length}`));
        }
        if (pushResult.errors.length > 0) {
          console.log(chalk.red(`  Errors: ${pushResult.errors.length}`));
          pushResult.errors.forEach((e) => console.log(chalk.red(`    ! ${e.skill}: ${e.error}`)));
        }
        console.log('');
      } catch (error) {
        handleError(error);
      }
    });

  oc.command('pull [skills...]')
    .description('Pull skills from OpenClaw workspace')
    .option('--all', 'Pull all skills', false)
    .option('--no-convert', 'Skip format conversion')
    .option('--overwrite', 'Overwrite existing skills', false)
    .option('--dry-run', 'Preview without copying', false)
    .option('-s, --source <dir>', 'Source OpenClaw skills directory')
    .option('-t, --target <dir>', 'Target skills directory', '.claude/skills')
    .action(async (skills: string[], options) => {
      const result = await loadPackage<OpenClawModule>('@skillbolt/openclaw');
      if (!result.success || !result.module) {
        return handleMissingPackage('openclaw');
      }

      try {
        console.log(chalk.cyan('\n  Pulling skills from OpenClaw...\n'));

        const pullResult = await result.module.pullSkills({
          skills: skills.length > 0 ? skills : undefined,
          sourceDir: options.source,
          targetDir: options.target,
          convert: options.convert !== false,
          overwrite: options.overwrite,
          dryRun: options.dryRun,
        });

        if (options.dryRun) {
          console.log(chalk.yellow('  [DRY RUN] No files were copied.\n'));
        }

        if (pullResult.pulled.length > 0) {
          console.log(chalk.green(`  Pulled: ${pullResult.pulled.length}`));
          pullResult.pulled.forEach((s) => console.log(chalk.gray(`    + ${s}`)));
        }
        if (pullResult.skipped.length > 0) {
          console.log(chalk.yellow(`  Skipped: ${pullResult.skipped.length} (already exist)`));
        }
        if (pullResult.converted.length > 0) {
          console.log(chalk.blue(`  Converted: ${pullResult.converted.length}`));
        }
        if (pullResult.errors.length > 0) {
          console.log(chalk.red(`  Errors: ${pullResult.errors.length}`));
          pullResult.errors.forEach((e) => console.log(chalk.red(`    ! ${e.skill}: ${e.error}`)));
        }
        console.log('');
      } catch (error) {
        handleError(error);
      }
    });
    
  oc.command('link <skill-dir>')
    .description('Link a skills directory to OpenClaw config')
    .option('-t, --target <path>', 'Target openclaw.json file path', '~/.openclaw/openclaw.json')
    .action(async (skillDir: string, options) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const os = await import('os');

      try {
        // 展开波浪号路径
        const targetPath = options.target.replace(/^~/, os.homedir());
        const skillPath = skillDir.replace(/^~/, os.homedir());

        // 转换为绝对路径（基于当前工作目录）
        const absoluteSkillPath = path.resolve(process.cwd(), skillPath);

        // 检查目录是否存在
        try {
          await fs.access(absoluteSkillPath);
        } catch {
          console.log(chalk.red(`\n  Error: Directory not found: ${absoluteSkillPath}\n`));
          process.exit(1);
        }

        // 读取配置文件
        let config: Record<string, any>;
        try {
          const content = await fs.readFile(targetPath, 'utf-8');
          config = JSON.parse(content);
        } catch {
          console.log(chalk.red(`\n  Error: Cannot read config file: ${targetPath}\n`));
          process.exit(1);
        }

        // 确保 skills.load.extraDirs 数组存在
        if (!config.skills) config.skills = {};
        if (!config.skills.load) config.skills.load = {};
        if (!config.skills.load.extraDirs) {
          config.skills.load.extraDirs = [];
        }

        // 检查路径是否已经存在
        if (config.skills.load.extraDirs.includes(absoluteSkillPath)) {
          console.log(chalk.yellow(`\n  Skipped: Directory already in extraDirs\n`));
          return;
        }

        // 添加路径
        config.skills.load.extraDirs.push(absoluteSkillPath);

        // 写入更新后的配置文件
        await fs.writeFile(targetPath, JSON.stringify(config, null, 2));

        console.log(chalk.cyan('\n  Successfully linked skills directory:\n'));
        console.log(chalk.gray(`  Directory: ${absoluteSkillPath}`));
        console.log(chalk.gray(`  Config:   ${targetPath}\n`));
      } catch (error) {
        handleError(error);
      }
    });
}
