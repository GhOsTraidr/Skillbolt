import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 'info';
    this.prefix = options.prefix ?? '';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatPrefix(): string {
    return this.prefix ? `[${this.prefix}] ` : '';
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(chalk.gray(`${this.formatPrefix()}[DEBUG]`), ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(chalk.blue(`${this.formatPrefix()}ℹ`), ...args);
    }
  }

  success(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(chalk.green(`${this.formatPrefix()}✓`), ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow(`${this.formatPrefix()}⚠`), ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red(`${this.formatPrefix()}✗`), ...args);
    }
  }

  log(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(...args);
    }
  }

  newline(): void {
    if (this.shouldLog('info')) {
      console.log();
    }
  }

  title(text: string): void {
    if (this.shouldLog('info')) {
      console.log();
      console.log(chalk.bold.underline(text));
      console.log();
    }
  }

  step(text: string): void {
    if (this.shouldLog('info')) {
      console.log(chalk.cyan(`${this.formatPrefix()}→`), text);
    }
  }

  box(text: string): void {
    if (this.shouldLog('info')) {
      const lines = text.split('\n');
      const maxLen = Math.max(...lines.map((l) => l.length));
      const border = '─'.repeat(maxLen + 2);

      console.log(chalk.gray(`┌${border}┐`));
      for (const line of lines) {
        console.log(chalk.gray('│'), line.padEnd(maxLen), chalk.gray('│'));
      }
      console.log(chalk.gray(`└${border}┘`));
    }
  }
}

export const logger = new Logger();

export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options);
}
