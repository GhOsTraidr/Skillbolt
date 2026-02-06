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
} from './generator.js';

export type {
  TemplateContext,
  TemplateSkillContext,
  TemplateSectionsContext,
  TemplateSection,
  TemplateConfigContext,
  TemplateOptions,
  HelperFunction,
  CompiledTemplate,
  TemplateLoaderOptions,
} from './template.js';

export { createTemplateContext } from './template.js';

export type {
  OutputFormat,
  OutputOptions,
  HtmlOutputOptions,
  JsonOutputOptions,
  MarkdownOutputOptions,
  WriteOutputOptions,
  OutputResult,
} from './output.js';

export type {
  BatchOptions,
  BatchResult,
  BatchSuccessItem,
  BatchFailedItem,
  BatchStats,
  ScanResult,
  IndexItem,
  IndexOptions,
} from './batch.js';
