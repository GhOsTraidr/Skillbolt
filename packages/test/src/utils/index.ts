import type { TestSuite, DefineTestsOptions } from '../types/index.js';

export function defineTests(options: DefineTestsOptions): TestSuite {
  return {
    name: options.description ?? options.skill,
    description: options.description,
    skill: options.skill,
    cases: options.cases,
    tags: options.tags,
    timeout: options.timeout,
    beforeAll: options.beforeAll,
    afterAll: options.afterAll,
    beforeEach: options.beforeEach,
    afterEach: options.afterEach,
    mock: options.mock,
  };
}
