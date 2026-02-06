export * from './types.js';
export { createSearchConfig, DEFAULT_SEARCH_CONFIG } from './config.js';
export { Searcher } from './searcher/index.js';

import type { SearchOptions, SearcherOptions, SelectedSkill } from './types.js';
import { Searcher } from './searcher/index.js';

export async function search(
  query: string,
  options?: SearcherOptions & SearchOptions
): Promise<SelectedSkill[]> {
  if (!options) {
    throw new Error('Search options required');
  }

  const { maxSkills, verbose, ...searcherOptions } = options;
  const searcher = new Searcher(searcherOptions);
  const result = await searcher.search(query, { maxSkills, verbose });
  return result.selectedSkills;
}
