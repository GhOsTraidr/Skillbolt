import pLimit from 'p-limit';

export class ExecutionThrottler {
  private limit: <T>(task: () => Promise<T>) => Promise<T>;

  constructor(maxConcurrent = 6) {
    this.limit = pLimit(maxConcurrent);
  }

  async executeBatch<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(tasks.map((task) => this.limit(task)));
  }
}
