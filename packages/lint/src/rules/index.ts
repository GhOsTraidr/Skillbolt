import type { Rule } from '../types/index.js';

import {
  frontmatterRequired,
  frontmatterFields,
  sectionsRequired,
  sectionNotEmpty,
} from './format/index.js';

import { descriptionFormat } from './style/index.js';

import { maxLength, examplesExist, triggersCount, stepsCount } from './best-practices/index.js';

import { noBrokenLinks } from './references/index.js';

export const formatRules = {
  'frontmatter-required': frontmatterRequired,
  'frontmatter-fields': frontmatterFields,
  'sections-required': sectionsRequired,
  'section-not-empty': sectionNotEmpty,
};

export const styleRules = {
  'description-format': descriptionFormat,
};

export const bestPracticesRules = {
  'max-length': maxLength,
  'examples-exist': examplesExist,
  'triggers-count': triggersCount,
  'steps-count': stepsCount,
};

export const referencesRules = {
  'no-broken-links': noBrokenLinks,
};

export const rules = {
  ...formatRules,
  ...styleRules,
  ...bestPracticesRules,
  ...referencesRules,
};

export const allRules: Rule[] = Object.values(rules);

export {
  frontmatterRequired,
  frontmatterFields,
  sectionsRequired,
  sectionNotEmpty,
  descriptionFormat,
  maxLength,
  examplesExist,
  triggersCount,
  stepsCount,
  noBrokenLinks,
};
