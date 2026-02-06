import ora from 'ora';

import type { Ora } from 'ora';

export interface SpinnerOptions {
  text?: string;
  color?: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray';
}

export interface Spinner {
  start(text?: string): Spinner;
  stop(): Spinner;
  succeed(text?: string): Spinner;
  fail(text?: string): Spinner;
  warn(text?: string): Spinner;
  info(text?: string): Spinner;
  text: string;
  isSpinning: boolean;
}

class SpinnerWrapper implements Spinner {
  private ora: Ora;

  constructor(options: SpinnerOptions = {}) {
    this.ora = ora({
      text: options.text,
      color: options.color ?? 'cyan',
    });
  }

  get text(): string {
    return this.ora.text;
  }

  set text(value: string) {
    this.ora.text = value;
  }

  get isSpinning(): boolean {
    return this.ora.isSpinning;
  }

  start(text?: string): Spinner {
    this.ora.start(text);
    return this;
  }

  stop(): Spinner {
    this.ora.stop();
    return this;
  }

  succeed(text?: string): Spinner {
    this.ora.succeed(text);
    return this;
  }

  fail(text?: string): Spinner {
    this.ora.fail(text);
    return this;
  }

  warn(text?: string): Spinner {
    this.ora.warn(text);
    return this;
  }

  info(text?: string): Spinner {
    this.ora.info(text);
    return this;
  }
}

export function createSpinner(options: SpinnerOptions | string = {}): Spinner {
  if (typeof options === 'string') {
    return new SpinnerWrapper({ text: options });
  }
  return new SpinnerWrapper(options);
}
