// Types
export type {
  SkillPlatform,
  SkillSectionType,
  SkillManifest,
  SkillSection,
  SkillFile,
  ParsedSkillResult,
  RuleSeverity,
  LintRuleConfig,
  LintConfig,
  RegistryConfig,
  SyncConfig,
  AnalyticsConfig,
  DefaultsConfig,
  TestConfig,
  LLMConfig,
  EmbeddingConfig,
  TreeBuildConfig,
  SearchConfig,
  ExecuteConfig,
  GuiConfig,
  GroupsConfig,
  SkillboltConfig,
  GlobalConfig,
  ProjectConfig,
  ResolvedConfig,
} from './types/index.js';

export { DEFAULT_CONFIG } from './types/index.js';

// Parser
export {
  parseFrontmatter,
  parseManifest,
  validateManifest,
  parseSections,
  getLineNumber,
  getSectionByType,
  getSectionsByType,
  parseSkillFile,
  parseSkillString,
  findSection,
  hasRequiredSections,
} from './parser/index.js';

export type { FrontmatterResult, ParseSkillOptions } from './parser/index.js';

// Config
export { loadConfig, loadGlobalConfig, loadProjectConfig, getConfigPath } from './config/index.js';

export type { LoadConfigOptions, LoadProjectConfigOptions } from './config/index.js';

// Logger
export { Logger, logger, createLogger, createSpinner } from './logger/index.js';
export type { LogLevel, LoggerOptions, Spinner, SpinnerOptions } from './logger/index.js';

// Errors
export {
  SkillboltError,
  ParseError,
  ConfigError,
  ValidationError,
  FileError,
  LLMError,
  TimeoutError,
  ExecutionError,
  SearchError,
  TreeBuildError,
} from './errors/index.js';

export type { ErrorCode, ErrorDetails } from './errors/index.js';

// LLM
export type {
  LLMMessage,
  LLMOptions,
  LLMAdapter,
  EmbeddingOptions,
  EmbeddingAdapter,
  LLMAdapterConfig,
  EmbeddingAdapterConfig,
} from './llm/index.js';

export { OpenAIAdapter } from './llm/index.js';
export { AnthropicAdapter } from './llm/index.js';
export { createLLMAdapter } from './llm/index.js';

// Utils
export {
  normalizePath,
  expandTilde,
  resolveSkillPath,
  isDirectory,
  isFile,
  exists,
  getSkillDir,
  getSkillName,
  joinPath,
  slugify,
  truncate,
  capitalize,
  camelCase,
  kebabCase,
  pascalCase,
  countWords,
  extractLines,
  indentText,
  dedent,
  escapeRegex,
  extractJSON,
  extractJSONArray,
} from './utils/index.js';

export * from './embedding/index.js';

export * from './demos/index.js';
