export type {
  GeneratorOptions,
  GeneratorResult,
  GeneratorMetadata,
  DocType,
  GeneratorFunction,
  TocItem,
  ReadmeOptions,
  ApiDocOptions,
  ExamplesOptions,
  TemplateContext,
  TemplateSkillContext,
  TemplateSectionsContext,
  TemplateSection,
  TemplateConfigContext,
  TemplateOptions,
  HelperFunction,
  CompiledTemplate,
  TemplateLoaderOptions,
  OutputFormat,
  OutputOptions,
  HtmlOutputOptions,
  JsonOutputOptions,
  MarkdownOutputOptions,
  WriteOutputOptions,
  OutputResult,
  BatchOptions,
  BatchResult,
  BatchSuccessItem,
  BatchFailedItem,
  BatchStats,
  ScanResult,
  IndexItem,
  IndexOptions,
} from './types/index.js';

export { createTemplateContext } from './types/index.js';

export {
  generateReadme,
  generateApiDocs,
  generateExamples,
  generateToc,
  tocToMarkdown,
} from './generator/index.js';

export {
  TemplateEngine,
  loadBuiltInTemplate,
  loadTemplate,
  getTemplateEngine,
  renderTemplate,
  registerHelper,
  slugify,
  formatDate,
  capitalize,
  truncate,
  joinArray,
  indent,
  codeBlock,
  anchor,
  defaultHelpers,
} from './templates/index.js';

export { toMarkdown, normalizeMarkdown, toHtml, toJson, writeOutput } from './output/index.js';

export type { JsonDocOutput } from './output/index.js';

export { scanSkillFiles, batchGenerate, generateIndex } from './batch/index.js';

export { createDocCli } from './cli/index.js';
