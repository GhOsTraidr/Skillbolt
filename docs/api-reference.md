# API Reference

This document provides the programming API reference for all Skill Kit packages.

## Table of Contents

- [@skillbolt/core](#skillboltcore)
- [@skillbolt/lint](#skillboltlint)
- [@skillbolt/init](#skillboltinit)
- [@skillbolt/registry](#skillboltregistry)
- [@skillbolt/analytics](#skillboltanalytics)
- [@skillbolt/compose](#skillboltcompose)
- [@skillbolt/convert](#skillboltconvert)
- [@skillbolt/distill](#skillboltdistill)
- [@skillbolt/doc](#skillboltdoc)
- [@skillbolt/sync](#skillboltsync)
- [@skillbolt/test](#skillbolttest)

---

## @skillbolt/core

The core package provides shared types, parsers, configuration, logging, and utility functions.

### Installation

```bash
npm install @skillbolt/core
```

### Type Definitions

#### SkillManifest

Skill manifest interface, defining the basic metadata of a skill.

```typescript
interface SkillManifest {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  triggers?: string[];
  platform?: SkillPlatform[];
  tags?: string[];
  repository?: string;
  [key: string]: unknown;
}
```

#### SkillSection

Skill section interface.

```typescript
interface SkillSection {
  type: string;
  content: string;
  line: number;
}
```

#### SkillFile

Complete skill file interface.

```typescript
interface SkillFile {
  manifest: SkillManifest;
  sections: SkillSection[];
  rawContent: string;
  filePath: string;
}
```

#### ParsedSkillResult

Parse result interface.

```typescript
interface ParsedSkillResult {
  manifest: SkillManifest;
  sections: SkillSection[];
  rawContent: string;
  filePath: string;
}
```

#### SkillPlatform

Supported platform types.

```typescript
type SkillPlatform = 'claude' | 'codex' | 'cursor' | 'continue' | 'custom';
```

### Parser

#### parseSkillFile

Parse skill file from file path.

```typescript
import { parseSkillFile } from '@skillbolt/core';

// From file path
const skill = await parseSkillFile('./my-skill/SKILL.md');

// From string content
const skill = await parseSkillFile(markdownContent);

console.log(skill.manifest.name);
console.log(skill.sections);
```

#### parseSkillString

Parse skill file synchronously from string content.

```typescript
import { parseSkillString } from '@skillbolt/core';

const skill = parseSkillString(markdownContent);
```

#### parseFrontmatter

Parse YAML frontmatter in Markdown content.

```typescript
import { parseFrontmatter } from '@skillbolt/core';

const result = parseFrontmatter(markdownContent);
// result.data: Partial<SkillManifest>
// result.content: string (content after removing frontmatter)
// result.line: number (line number where frontmatter ends)
```

#### parseManifest

Parse skill manifest.

```typescript
import { parseManifest } from '@skillbolt/core';

const manifest = parseManifest(content);
```

#### parseSections

Parse skill sections.

```typescript
import { parseSections } from '@skillbolt/core';

const sections = parseSections(markdownContent);
// Returns: SkillSection[]
```

#### validateManifest

Validate if the skill manifest is valid.

```typescript
import { validateManifest } from '@skillbolt/core';

const result = validateManifest(manifest);
// result.valid: boolean
// result.errors: string[]
```

#### getSectionByType

Get the first section of a specific type.

```typescript
import { getSectionByType } from '@skillbolt/core';

const section = getSectionByType(skill, '@Claude');
```

#### getSectionsByType

Get all sections of a specific type.

```typescript
import { getSectionsByType } from '@skillbolt/core';

const sections = getSectionsByType(skill, '@User');
```

#### findSection

Find sections containing specific text.

```typescript
import { findSection } from '@skillbolt/core';

const section = findSection(skill, 'example');
```

#### hasRequiredSections

Check if it contains required sections.

```typescript
import { hasRequiredSections } from '@skillbolt/core';

const hasAll = hasRequiredSections(skill);
```

#### getLineNumber

Get the line number at a specific position in content.

```typescript
import { getLineNumber } from '@skillbolt/core';

const line = getLineNumber(content, position);
```

### Configuration

#### loadConfig

Load complete configuration (global + project).

```typescript
import { loadConfig } from '@skillbolt/core';

const config = await loadConfig();
// Or use options
const config = await loadConfig({ cwd: './project' });
```

#### loadGlobalConfig

Load only global configuration.

```typescript
import { loadGlobalConfig } from '@skillbolt/core';

const globalConfig = await loadGlobalConfig();
```

#### loadProjectConfig

Load only project configuration.

```typescript
import { loadProjectConfig } from '@skillbolt/core';

const projectConfig = await loadProjectConfig({ cwd: './project' });
```

#### getConfigPath

Get configuration file path.

```typescript
import { getConfigPath } from '@skillbolt/core';

const configPath = getConfigPath(); // ~/.skillbolt/config.json
```

### Logger System

#### logger

Default logger instance.

```typescript
import { logger } from '@skillbolt/core';

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
logger.success('Success message');
```

#### createLogger

Create custom logger.

```typescript
import { createLogger } from '@skillbolt/core';

const log = createLogger({
  level: 'debug',
  prefix: 'MyApp',
});

log.info('Message'); // [MyApp] ℹ Message
```

**LoggerOptions:**

```typescript
interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  prefix?: string;
}
```

#### createSpinner

Create progress indicator.

```typescript
import { createSpinner } from '@skillbolt/core';

const spinner = createSpinner('Loading...');
spinner.start();

// Update text
spinner.text = 'Still processing...';

// Stop
spinner.stop('Done!');
spinner.succeed('Success!');
spinner.fail('Failed!');
spinner.warn('Warning!');
spinner.info('Info!');
```

### Error Handling

#### SkillboltError

Base class for all Skill Kit errors.

```typescript
import { SkillboltError } from '@skillbolt/core';

throw new SkillboltError('Something went wrong', 'UNKNOWN_ERROR', {
  file: 'SKILL.md',
  line: 10,
});
```

#### ParseError

Error thrown when parsing fails.

```typescript
import { ParseError } from '@skillbolt/core';

throw new ParseError('Invalid frontmatter', { line: 5 });
```

#### ConfigError

Error thrown when configuration is invalid.

```typescript
import { ConfigError } from '@skillbolt/core';

throw new ConfigError('Config file not found');
```

#### ValidationError

Error thrown when validation fails.

```typescript
import { ValidationError } from '@skillbolt/core';

throw new ValidationError('Missing required field: name');
```

#### FileError

Error thrown when file operations fail.

```typescript
import { FileError } from '@skillbolt/core';

throw new FileError('File not found', { path: '/path/to/file.md' });
```

### Utility Functions

#### Path Utilities

```typescript
import {
  normalizePath,
  expandTilde,
  resolveSkillPath,
  isDirectory,
  isFile,
  exists,
  getSkillDir,
  getSkillName,
  joinPath,
} from '@skillbolt/core';

// Normalize path
normalizePath('foo\\bar'); // 'foo/bar'

// Expand tilde
expandTilde('~/skills'); // '/home/user/skills'

// Resolve skill path
resolveSkillPath('./skill', '/project'); // '/project/skill'

// Check path type
await isDirectory('./skills'); // true/false
await isFile('./SKILL.md'); // true/false
await exists('./path'); // true/false

// Get skill directory and name
getSkillDir('/path/to/skills/my-skill/skill.md'); // '/path/to/skills/my-skill'
getSkillName('/path/to/skills/my-skill/skill.md'); // 'my-skill'

// Join paths
joinPath('dir', 'subdir', 'file.txt');
```

#### String Utilities

```typescript
import {
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
} from '@skillbolt/core';

slugify('Hello World'); // 'hello-world'
truncate('Long text', 5); // 'Lo...'
capitalize('hello'); // 'Hello'
camelCase('hello world'); // 'helloWorld'
kebabCase('helloWorld'); // 'hello-world'
pascalCase('hello world'); // 'HelloWorld'
countWords('Hello World'); // 2
extractLines('line1\nline2\nline3', 1, 2); // ['line2']
indentText('text', 2); // '  text'
dedent('  text'); // 'text'
escapeRegex('a.b'); // 'a\\.b'
```

---

## @skillbolt/lint

Lint package provides skill file format checking functionality.

### Installation

```bash
npm install @skillbolt/lint
```

### Linter Class

```typescript
import { Linter } from '@skillbolt/lint';

const linter = new Linter();

// Lint file
const results = await linter.lintFile('./SKILL.md');

// Lint string content
const results = await linter.lintString(content, 'SKILL.md');

// Lint and auto-fix
const results = await linter.lintFile('./SKILL.md', { fix: true });
```

**LinterOptions:**

```typescript
interface LinterOptions {
  rules?: RulesConfig;
  ignore?: string[];
  fix?: boolean;
  format?: FormatterName;
}
```

**LintOptions:**

```typescript
interface LintOptions {
  fix?: boolean;
  config?: ResolvedLintConfig;
}
```

### LintResult

```typescript
interface LintResult {
  filePath: string;
  messages: LintMessage[];
  summary: LintSummary;
  hasErrors: boolean;
}

interface LintMessage {
  ruleId: string;
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  line: number;
  column: number;
  fix?: FixInfo;
}

interface LintSummary {
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

interface FixInfo {
  range: [number, number];
  text: string;
}
```

### Built-in Rules

#### Format Rules

```typescript
import {
  frontmatterRequired,
  frontmatterFields,
  sectionsRequired,
  sectionNotEmpty
} from '@skillbolt/lint';

// frontmatter-required - Check required frontmatter fields
// frontmatter-fields - Validate frontmatter field types and format
// sections-required - Check required sections
// section-not-empty - Check if section content is empty
```

#### Style Rules

```typescript
import { descriptionFormat } from '@skillbolt/lint';

// description-format - Validate description format
```

#### Best Practices Rules

```typescript
import {
  examplesExist,
  maxLength,
  triggersCount,
  stepsCount,
  noBrokenLinks
} from '@skillbolt/lint';

// examples-exist - Check if usage examples are included
// max-length - Check maximum length of file or sections
// triggers-count - Check trigger word count
// steps-count - Check step count
// no-broken-links - Check if internal links are valid
```

### Configuration

#### loadLintConfig

Load lint configuration.

```typescript
import { loadLintConfig } from '@skillbolt/lint';

const config = await loadLintConfig('./project');
```

#### defineConfig

Type-safe configuration helper.

```typescript
import { defineConfig } from '@skillbolt/lint';

export default defineConfig({
  extends: 'recommended',
  rules: {
    'format/frontmatter-required': 'error',
    'best/max-length': ['warn', { max: 5000 }],
  },
});
```

#### presets

Preset configurations.

```typescript
import { presets } from '@skillbolt/lint';

// presets.recommended - Recommended configuration
// presets.strict - Strict configuration
```

### Formatters

```typescript
import { getFormatter, formatters } from '@skillbolt/lint';

// Get formatter
const formatter = getFormatter('stylish');
const output = formatter(results);

// Available formatters
const stylish = formatters.stylish(results);
const json = formatters.json(results);
const github = formatters.github(results);
```

---

## @skillbolt/init

Init package provides skill project scaffolding functionality.

### Installation

```bash
npm install @skillbolt/init
```

### initSkill

Create new skill project.

```typescript
import { initSkill } from '@skillbolt/init';

const result = await initSkill({
  name: 'my-skill',
  description: 'My awesome skill',
  template: 'default',
  platform: 'claude',
  output: './skills',
});

console.log(result.success); // true
console.log(result.path); // './skills/my-skill'
console.log(result.tree); // Directory tree structure
```

**InitOptions:**

```typescript
interface InitOptions {
  name?: string;
  description?: string;
  platform?: 'claude' | 'cursor' | 'continue';
  template?: string;
  output?: string;
  author?: string;
  triggers?: string[];
  noPrompts?: boolean;
  overwrite?: boolean;
}
```

**GeneratedResult:**

```typescript
interface GeneratedResult {
  success: boolean;
  path: string;
  tree: string;
  error?: string;
}
```

### Interactive Prompts

```typescript
import { runInteractivePrompts } from '@skillbolt/init';

const answers = await runInteractivePrompts();
// Returns: InitOptions with user's answers
```

### Template System

```typescript
import { loadTemplate, getTemplateDefinition } from '@skillbolt/init';

// Get template definition
const template = getTemplateDefinition('default');

// Load template files
const files = await loadTemplate('default');
console.log(files); // Template file list
```

### Validation Functions

```typescript
import {
  validateName,
  validateDescription,
  isValidTemplate,
  isValidPlatform
} from '@skillbolt/init';

// Validate skill name
validateName('my-skill'); // true

// Validate description
validateDescription('A good description'); // true

// Validate template
isValidTemplate('default'); // true

// Validate platform
isValidPlatform('claude'); // true
```

---

## @skillbolt/registry

Registry package provides skill installation and management functionality.

### Installation

```bash
npm install @skillbolt/registry
```

### installSkill

Install skills from various sources.

```typescript
import { installSkill } from '@skillbolt/registry';

// From local path
const result = await installSkill('./my-skill');

// From GitHub
const result = await installSkill('github:user/repo');

// From registry
const result = await installSkill('@user/skill-name');
```

**InstallOptions:**

```typescript
interface InstallOptions {
  source?: InstallSource;
  version?: string;
  output?: string;
  cache?: boolean;
  force?: boolean;
  dependencies?: boolean;
  mode?: InstallMode;
}

type InstallSource = 'registry' | 'github' | 'local';
type InstallMode = 'production' | 'development';
```

**InstallResult:**

```typescript
interface InstallResult {
  success: boolean;
  name: string;
  version: string;
  path: string;
  error?: string;
}
```

### listSkills

List installed skills.

```typescript
import { listSkills, formatSkillList } from '@skillbolt/registry';

const skills = await listSkills();

// Format display
const formatted = formatSkillList(skills);
console.log(formatted);
```

**InstalledSkill:**

```typescript
interface InstalledSkill {
  name: string;
  version: string;
  path: string;
  source: InstallSource;
  installedAt: string;
  lastUsed?: string;
  dependencies?: string[];
}
```

### updateSkill

Update installed skills.

```typescript
import { updateSkill, checkOutdated } from '@skillbolt/registry';

// Check updates
const outdated = await checkOutdated();

// Update specific skill
const result = await updateSkill('skill-name');

// Update all
const results = await updateSkill('*');
```

**UpdateOptions:**

```typescript
interface UpdateOptions {
  version?: string;
  force?: boolean;
}
```

**UpdateResult:**

```typescript
interface UpdateResult {
  success: boolean;
  name: string;
  updated: boolean;
  previousVersion?: string;
  newVersion?: string;
  error?: string;
}
```

**OutdatedSkill:**

```typescript
interface OutdatedSkill {
  name: string;
  current: string;
  latest: string;
  updateType: 'major' | 'minor' | 'patch';
}
```

### uninstallSkill

Uninstall installed skills.

```typescript
import { uninstallSkill } from '@skillbolt/registry';

await uninstallSkill('skill-name', { force: true });
```

**UninstallOptions:**

```typescript
interface UninstallOptions {
  force?: boolean;
  removeDependencies?: boolean;
}
```

### Storage Management

```typescript
import {
  LocalStorage,
  MetadataManager,
  getDefaultStorageRoot,
  getDefaultCachePath,
  getMetadataPath
} from '@skillbolt/registry';

// Access local storage
const storage = new LocalStorage();
const skills = await storage.list();
const skill = await storage.get('skill-name');

// Metadata management
const metadata = new MetadataManager();
await metadata.save(skillInfo);
const info = await metadata.load('skill-name');

// Get paths
const storageRoot = getDefaultStorageRoot(); // ~/.skillbolt/skills
const cachePath = getDefaultCachePath(); // ~/.skillbolt/cache
const metadataPath = getMetadataPath(); // ~/.skillbolt/metadata.json
```

### SkillHubClient

Client for interacting with the skill registry API.

```typescript
import { SkillHubClient } from '@skillbolt/registry';

const client = new SkillHubClient();

// Search skills
const results = await client.search('git');

// Get skill details
const details = await client.getDetails('git-workflow');
```

---

## @skillbolt/analytics

Analytics package provides skill usage data analysis functionality.

### Installation

```bash
npm install @skillbolt/analytics
```

### createCollector

Create data collector.

```typescript
import { createCollector } from '@skillbolt/analytics';

const collector = createCollector({
  enabled: true,
  privacyLevel: 'medium',
  dbPath: './analytics.db',
  retentionDays: 90
});

// Track events
collector.track({
  skillName: 'git-workflow',
  eventType: 'trigger',
  triggerPhrase: 'git help',
  duration: 150,
  success: true
});

// Query events
const events = collector.query({
  skillName: 'git-workflow',
  startDate: new Date('2024-01-01'),
  endDate: new Date()
});

// Cleanup old data
collector.cleanup();
collector.close();
```

**AnalyticsCollectorOptions:**

```typescript
interface AnalyticsCollectorOptions {
  enabled?: boolean;
  privacyLevel?: PrivacyLevel;
  dbPath?: string;
  retentionDays?: number;
}

type PrivacyLevel = 'off' | 'low' | 'medium' | 'high';
```

### Statistics Calculation

```typescript
import {
  calculateSkillStats,
  calculateAggregatedStats,
  calculateTrends
} from '@skillbolt/analytics';

// Calculate single skill statistics
const stats = calculateSkillStats(events, 'git-workflow');

// Calculate aggregated statistics for all skills
const aggregated = calculateAggregatedStats(events);

// Calculate trend changes
const trends = calculateTrends(currentEvents, previousEvents);
```

**SkillStats:**

```typescript
interface SkillStats {
  skillName: string;
  totalTriggers: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgDuration: number;
  triggerDistribution: Record<string, number>;
}
```

### PatternAnalyzer

Pattern analyzer, analyzes trigger phrase patterns.

```typescript
import { PatternAnalyzer } from '@skillbolt/analytics';

const analyzer = new PatternAnalyzer(events);

// Get trigger phrase patterns
const patterns = analyzer.getTriggerPatterns();

// Get most commonly used triggers
const topTriggers = analyzer.getMostCommonTriggers(10);

// Find unused skills
const unused = analyzer.getUnusedSkills(allSkills, 30); // Unused for 30+ days
```

### SuggestionGenerator

Suggestion generator, generates optimization suggestions based on usage data.

```typescript
import { SuggestionGenerator } from '@skillbolt/analytics';

const generator = new SuggestionGenerator(events, allSkills, triggers);

const suggestions = generator.generate({
  maxSuggestions: 10,
  minConfidence: 0.7
});

// Get high-priority suggestions
const highPriority = generator.getHighPrioritySuggestions();
```

**Suggestion:**

```typescript
interface Suggestion {
  type: 'remove_skill' | 'add_trigger' | 'optimize' | 'deprecate';
  skillName: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  reason: string;
  suggestion: string;
}
```

### Report Generation

```typescript
import {
  generateReport,
  exportToJSON,
  exportToCSV,
  exportToHTML
} from '@skillbolt/analytics';

// Generate report
const report = generateReport(events, {
  includeStats: true,
  includePatterns: true,
  includeSuggestions: true
});

// Export to different formats
exportToJSON(report, './report.json');
exportToCSV(report, './report.csv');
exportToHTML(report, './report.html');

// Terminal report
import { renderTerminalReport, renderBarChart } from '@skillbolt/analytics';
console.log(renderTerminalReport(report));
console.log(renderBarChart(stats, 'Skill Usage'));
```

---

## @skillbolt/compose

Compose package provides workflow orchestration engine.

### Installation

```bash
npm install @skillbolt/compose
```

### executeWorkflow

Execute workflow.

```typescript
import { executeWorkflow } from '@skillbolt/compose';

const result = await executeWorkflow(workflow, {
  skillExecutor: async (skillName, inputs, context) => {
    // Custom skill executor
    return { output: 'processed' };
  }
});

console.log(result.status); // 'completed', 'failed', 'cancelled'
console.log(result.steps);  // Step result array
```

**WorkflowResult:**

```typescript
interface WorkflowResult {
  status: 'completed' | 'failed' | 'cancelled';
  steps: StepResult[];
  error?: Error;
  duration: number;
}
```

### createExecutor

Create workflow executor.

```typescript
import { createExecutor } from '@skillbolt/compose';

const executor = createExecutor(workflow, {
  skillExecutor: mySkillExecutor,
  inputs: { message: 'Hello' }
});

// Cancel execution
setTimeout(() => executor.cancel(), 5000);

const result = await executor.execute();
```

### Event Handling

```typescript
const result = await executeWorkflow(workflow, {
  skillExecutor: myExecutor,
  onStepStart: (step, context) => {
    console.log(`Starting step: ${step.id}`);
  },
  onStepComplete: (step, result, context) => {
    console.log(`Completed step: ${step.id}`);
  },
  onStepError: (step, error, context) => {
    console.error(`Error in step: ${step.id}`, error);
  },
  onWorkflowStart: (workflow) => {
    console.log('Starting workflow');
  },
  onWorkflowComplete: (result) => {
    console.log('Workflow completed', result);
  }
});
```

### Parsing and Validation

```typescript
import {
  parseWorkflowFile,
  parseWorkflowString,
  validateWorkflow,
  getWorkflowSchema
} from '@skillbolt/compose';

// Parse from file
const workflow = await parseWorkflowFile('./workflow.yaml');

// Parse from string
const workflow = parseWorkflowString(yaml);

// Validate workflow
const result = await validateWorkflow(workflow);

// Get JSON Schema
const schema = getWorkflowSchema();
```

### Variable Interpolation

```typescript
import { interpolate, resolveVariable } from '@skillbolt/compose';

const context = {
  inputs: { name: 'Alice' },
  step1: { result: 'success' }
};

// Interpolate string
const result = interpolate('Hello ${inputs.name}, status: ${step1.result}', context);
// "Hello Alice, status: success"

// Resolve variable
const value = resolveVariable('inputs.name', context); // "Alice"
```

### Condition Evaluation

```typescript
import { evaluateCondition } from '@skillbolt/compose';

const context = createExecutionContext(workflow, { inputs: { count: 5 } });

const isTrue = await evaluateCondition('${inputs.count} > 3', context);
// true
```

### Visualization

```typescript
import { toAscii, toMermaid } from '@skillbolt/compose';

// ASCII flowchart
const ascii = toAscii(workflow);
console.log(ascii);

// Mermaid diagram
const mermaid = toMermaid(workflow);
console.log(mermaid);
```

### Workflow Types

```typescript
interface Workflow {
  name: string;
  description?: string;
  inputs?: Record<string, InputDefinition>;
  outputs?: Record<string, OutputDefinition>;
  steps: WorkflowStep[];
}

interface SkillStep {
  id: string;
  skill: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  when?: string;
  onError?: ErrorStrategy;
}

interface ParallelStep {
  id: string;
  parallel: WorkflowStep[];
}

interface ConditionStep {
  id: string;
  condition: {
    if: string;
    then: WorkflowStep;
    else?: WorkflowStep;
  };
}

interface ForeachStep {
  id: string;
  foreach: {
    items: string;
    as: string;
    step: WorkflowStep;
  };
}

interface WhileStep {
  id: string;
  while: {
    condition: string;
    step: WorkflowStep;
  };
}
```

---

## @skillbolt/convert

Convert package provides skill format conversion functionality.

### Installation

```bash
npm install @skillbolt/convert
```

### convert

Convert skill format.

```typescript
import { convert } from '@skillbolt/convert';

const result = await convert(skillContent, 'claude', 'codex');
console.log(result.content); // Converted content
console.log(result.warnings); // Conversion warnings
```

**ConvertOptions:**

```typescript
interface ConvertOptions {
  to: Format | 'all';
  output?: string;
  overwrite?: boolean;
  preserveSource?: boolean;
}

type Format = 'claude' | 'codex' | 'cursor' | 'continue';
```

**ConvertResult:**

```typescript
interface ConvertResult {
  source: Format;
  target: Format;
  inputPath: string;
  outputPath: string;
  success: boolean;
  warnings?: string[];
  error?: string;
}
```

### Format Detection

```typescript
import { detectFormat, detectFormatFromPath } from '@skillbolt/convert';

// Detect from content
const result = detectFormat(content);
console.log(result.format); // 'claude'
console.log(result.confidence); // 95

// Detect from file path
const result = detectFormatFromPath('/path/to/skill.claude');
```

**DetectResult:**

```typescript
interface DetectResult {
  format: Format;
  confidence: number;
  indicators: string[];
}
```

### Parsers

```typescript
import {
  parseSkill,
  parseSkillAuto,
  parseClaudeSkill,
  parseCodexSkill,
  parseCursorSkill,
  parseContinueSkill
} from '@skillbolt/convert';

// Auto-detect and parse
const skill = parseSkillAuto(content);

// Parse specific format
const claudeSkill = parseClaudeSkill(content);
const codexSkill = parseCodexSkill(content);
```

**ParsedSkill:**

```typescript
interface ParsedSkill {
  metadata: SkillMetadata;
  sections: ParsedSection[];
  rawContent: string;
}

interface SkillMetadata {
  name: string;
  description: string;
  version?: string;
  model?: string;
  triggers?: string[];
  author?: string;
  [key: string]: unknown;
}
```

### Converters

```typescript
import {
  getConverter,
  ClaudeToCodexConverter,
  CodexToClaudeConverter
} from '@skillbolt/convert';

// Get converter
const converter = getConverter('claude', 'codex');

// Use converter class
const converter = new ClaudeToCodexConverter();
const result = converter.convertWithWarnings(parsedSkill);
```

### Batch Conversion

```typescript
import { convertToAll } from '@skillbolt/convert';

const results = await convertToAll(claudeSkill, './output');
// [
//   { format: 'codex', path: './output/skill.codex.json', warnings: [] },
//   { format: 'cursor', path: './output/skill.cursor.json', warnings: [] },
//   { format: 'continue', path: './output/skill.continue.json', warnings: [] }
// ]
```

---

## @skillbolt/distill

Distill package provides functionality for extracting skills from conversation history.

### Installation

```bash
npm install @skillbolt/distill
```

### Distiller Class

```typescript
import { Distiller } from '@skillbolt/distill';

const distiller = new Distiller();

const result = await distiller.distill(session, {
  verbose: true
});

console.log(result.skill);
console.log(result.metadata);
```

**DistillerOptions:**

```typescript
interface DistillerOptions {
  userPrompts?: string[];
  skipFailedFilter?: boolean;
  verbose?: boolean;
}
```

**DistillResult:**

```typescript
interface DistillResult {
  skill: Skill;
  metadata: DistillMetadata;
}

interface DistillMetadata {
  sessionId: string;
  distilledAt: string;
  tokenUsage: {
    input: number;
    output: number;
  };
  stepsFiltered: number;
}
```

### Session Type

```typescript
interface Session {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
  }>;
}
```

### Skill Type

```typescript
interface Skill {
  metadata: SkillMetadata;
  overview: string;
  triggers: string[];
  prerequisites: string[];
  steps: SkillStep[];
  parameters: SkillParameter[];
  errorHandling: string[];
  examples: string[];
  notes: string[];
}

interface SkillStep {
  id: string;
  description: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

interface SkillParameter {
  name: string;
  type: 'string' | 'boolean' | 'number';
  description: string;
  default?: unknown;
  required: boolean;
}
```

### Components

```typescript
import {
  ConversationPreprocessor,
  FailedAttemptFilter,
  ParameterExtractor,
  LLMEngine
} from '@skillbolt/distill';

// Conversation preprocessor
const preprocessor = new ConversationPreprocessor();
const result = preprocessor.process(session.messages);

// Failed attempt filter
const filter = new FailedAttemptFilter();
const result = filter.filter(messages);

// Parameter extractor
const extractor = new ParameterExtractor();
const result = extractor.extract(steps, []);

// LLM engine
const engine = new LLMEngine();
const intent = await engine.extractIntent(session);
const steps = await engine.distillSteps(session, intent);
const description = await engine.generateDescription(intent);
const enhanced = await engine.enhanceQuality(skill);
```

---

## @skillbolt/doc

Doc package provides documentation generation functionality.

### Installation

```bash
npm install @skillbolt/doc
```

### Generate Documentation

```typescript
import {
  generateReadme,
  generateApiDocs,
  generateExamples,
  generateToc
} from '@skillbolt/doc';

// Generate README
const readme = await generateReadme(skill, {
  includeExamples: true,
  includeApi: true
});

// Generate API documentation
const apiDocs = await generateApiDocs(skill, {
  includeParameters: true,
  includeExamples: true
});

// Generate examples documentation
const examples = await generateExamples(skill);

// Generate table of contents
const toc = generateToc(skill);
```

**GeneratorOptions:**

```typescript
interface GeneratorOptions {
  includeOverview?: boolean;
  includeInstallation?: boolean;
  includeUsage?: boolean;
  includeExamples?: boolean;
  includeApi?: boolean;
  format?: 'markdown' | 'html' | 'json';
}
```

### Template System

```typescript
import {
  loadBuiltInTemplate,
  loadTemplate,
  renderTemplate,
  registerHelper
} from '@skillbolt/doc';

// Load built-in template
const template = loadBuiltInTemplate('readme');

// Load custom template
const template = await loadTemplate('./templates/my-template.md');

// Render template
const context = { skill, metadata, sections };
const content = renderTemplate(template, context);

// Register custom helper
registerHelper('customHelper', (value: string) => {
  return value.toUpperCase();
});
```

### Template Helpers

```typescript
import {
  slugify,
  formatDate,
  capitalize,
  truncate,
  joinArray,
  indent,
  codeBlock,
  anchor
} from '@skillbolt/doc';

// Use in templates
// {{ slugify skill.name }}
// {{ formatDate metadata.createdAt }}
// {{ capitalize description }}
// {{ truncate content 100 }}
// {{ joinArray triggers ', ' }}
// {{ indent code 2 }}
// {{ codeBlock code 'typescript' }}
// {{ anchor 'section-title' }}
```

### Output Formats

```typescript
import {
  toMarkdown,
  toHtml,
  toJson,
  writeOutput
} from '@skillbolt/doc';

// Convert to Markdown
const markdown = toMarkdown(content);

// Convert to HTML
const html = toHtml(content, {
  theme: 'light',
  highlightCode: true
});

// Convert to JSON
const json = toJson(content, {
  pretty: true,
  indent: 2
});

// Write to file
await writeOutput(content, 'output.md', {
  format: 'markdown',
  overwrite: true
});
```

### Batch Generation

```typescript
import {
  scanSkillFiles,
  batchGenerate,
  generateIndex
} from '@skillbolt/doc';

// Scan skill files
const skills = await scanSkillFiles('./skills', {
  recursive: true,
  pattern: '*.md'
});

// Batch generate documentation
const result = await batchGenerate('./skills', {
  output: './docs',
  formats: ['readme', 'api']
});

// Generate index
await generateIndex(skills, {
  output: './README.md',
  format: 'markdown'
});
```

---

## @skillbolt/sync

Sync package provides skill synchronization functionality.

### Installation

```bash
npm install @skillbolt/sync
```

### SyncEngine

Synchronization engine.

```typescript
import { SyncEngine } from '@skillbolt/sync';

const syncEngine = new SyncEngine({
  backend: {
    type: 'github-gist',
    credentials: {
      token: 'your-github-token',
      gistId: 'your-gist-id'
    }
  }
});

// Push skills
const pushResult = await syncEngine.push();
console.log(`Pushed ${pushResult.pushed} skills`);

// Pull skills
const pullResult = await syncEngine.pull();
console.log(`Pulled ${pullResult.pulled} skills`);

// Check status
const status = await syncEngine.getStatus();
console.log(`Local: ${status.local.length}, Remote: ${status.remote.length}`);
```

**SyncEngineOptions:**

```typescript
interface SyncEngineOptions {
  backend: BackendConfig;
  autoSync?: AutoSyncConfig;
  queue?: QueueConfig;
}

interface BackendConfig {
  type: BackendType;
  credentials: Credentials;
}

type BackendType = 'github-gist' | 'supabase' | 'custom';
```

### Backend Configuration

```typescript
import {
  SupabaseBackend,
  GitHubGistBackend,
  createBackend
} from '@skillbolt/sync';

// GitHub Gist
const backend = new GitHubGistBackend({
  token: process.env.GITHUB_TOKEN,
  gistId: process.env.GIST_ID
});

// Supabase
const backend = new SupabaseBackend({
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key'
});

// Create backend
const backend = createBackend({
  type: 'github-gist',
  credentials: { token: 'xxx', gistId: 'yyy' }
});
```

### Sync Operations

```typescript
import { push, pull, syncStatus } from '@skillbolt/sync';

// Push
const result = await push({
  backend: 'github-gist',
  credentials: { token: 'xxx', gistId: 'yyy' },
  skills: ['skill-1', 'skill-2'],
  force: false
});

// Pull
const result = await pull({
  backend: 'supabase',
  credentials: { url: 'xxx', anonKey: 'yyy' },
  force: false
});

// Status
const status = await syncStatus();
```

**PushResult:**

```typescript
interface PushResult {
  pushed: number;
  skipped: number;
  failed: number;
  errors: Error[];
}
```

**PullResult:**

```typescript
interface PullResult {
  pulled: number;
  skipped: number;
  failed: number;
  errors: Error[];
}
```

**StatusResult:**

```typescript
interface StatusResult {
  local: SkillStatus[];
  remote: SkillStatus[];
  overallStatus: OverallStatus;
}

interface SkillStatus {
  name: string;
  status: 'synced' | 'local-only' | 'remote-only' | 'conflict';
  localVersion?: string;
  remoteVersion?: string;
  localModifiedAt?: Date;
  remoteModifiedAt?: Date;
}

type OverallStatus = 'synced' | 'needs-sync' | 'has-conflicts';
```

### Conflict Handling

```typescript
import {
  detectConflicts,
  resolveConflict,
  resolveConflictWithBackup
} from '@skillbolt/sync';

// Detect conflicts
const conflicts = await detectConflicts(localSkills, remoteSkills);

// Resolve conflict
await resolveConflict(conflict, 'local'); // Use local version
await resolveConflict(conflict, 'remote'); // Use remote version
await resolveConflictWithBackup(conflict, 'local'); // Use local after backup
```

### Offline Queue

```typescript
import { OfflineQueue } from '@skillbolt/sync';

const queue = new OfflineQueue({
  storagePath: './.skillbolt/queue.json'
});

// Auto sync when network available
queue.on('network:available', async () => {
  await queue.flush();
});

// Add operation to queue
await queue.add({
  type: 'push',
  skillId: 'my-skill',
  timestamp: Date.now()
});

// Manually flush queue
await queue.flush();
```

### Network Monitoring

```typescript
import { createNetworkMonitor } from '@skillbolt/sync';

const monitor = createNetworkMonitor({
  checkInterval: 5000,
  pingUrl: 'https://www.google.com'
});

monitor.on('online', async () => {
  console.log('Network available, syncing...');
  await syncEngine.pull();
});

monitor.on('offline', () => {
  console.log('Network unavailable');
});

monitor.start();
```

---

## @skillbolt/test

Test package provides skill trigger word testing framework.

### Installation

```bash
npm install @skillbolt/test
```

### createTestRunner

Create test runner.

```typescript
import { createTestRunner } from '@skillbolt/test';

const runner = createTestRunner({
  cwd: process.cwd(),
  watch: false,
  coverage: false,
  verbose: false
});

// Run tests
const result = await runner.run(['./tests/basic-test.skill-test.yaml']);

console.log('Total tests:', result.totalTests);
console.log('Passed:', result.passed);
console.log('Failed:', result.failed);
```

**TestRunnerOptions:**

```typescript
interface TestRunnerOptions {
  config?: Partial<SkillTestConfig>;
  cwd?: string;
  watch?: boolean;
  coverage?: boolean;
  verbose?: boolean;
  onSuiteStart?: (suite: TestSuite) => void;
  onSuiteEnd?: (result: TestSuiteResult) => void;
  onTestStart?: (testCase: TestCase) => void;
  onTestEnd?: (result: TestCaseResult) => void;
}
```

**TestRunResult:**

```typescript
interface TestRunResult {
  totalSuites: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  suites: TestSuiteResult[];
  success: boolean;
}
```

### runTests

Run tests.

```typescript
import { runTests } from '@skillbolt/test';

// Run from test file
const result = await runTests('./tests/basic-test.skill-test.yaml');

// Run from test suite
const result = await runTests({
  description: 'Test suite',
  skill: './skill.md',
  cases: [
    {
      name: 'Test case',
      input: 'git init',
      shouldTrigger: true
    }
  ]
});
```

### Defining Tests

Test files use YAML or JavaScript/TypeScript format.

#### YAML Format (`.skill-test.yaml`)

```yaml
description: Git Workflow Tests
skill: ./path/to/skill.md
cases:
  - name: Git init trigger
    input: git init
    shouldTrigger: true
    matchType: exact
    minConfidence: 0.9
  
  - name: Non-matching input
    input: hello world
    shouldTrigger: false
```

#### JavaScript/TypeScript Format

```typescript
import { defineTests } from '@skillbolt/test';

export default defineTests({
  description: 'Git workflow trigger tests',
  skill: './path/to/skill.md',
  cases: [
    {
      name: 'Git init trigger',
      input: 'git init',
      shouldTrigger: true,
      matchType: 'exact',
      minConfidence: 0.9
    },
    {
      name: 'Git add trigger',
      input: 'git add .',
      shouldTrigger: true
    },
    {
      name: 'Non-matching input',
      input: 'hello world',
      shouldTrigger: false
    }
  ]
});
```

**DefineTestsOptions:**

```typescript
interface DefineTestsOptions {
  description?: string;
  skill: string;
  cases: TestCase[];
  tags?: string[];
  timeout?: number;
  beforeAll?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
  mock?: MockConfig;
}
```

**TestCase:**

```typescript
interface TestCase {
  name: string;
  input: string;
  shouldTrigger: boolean;
  expectedSkill?: string;
  matchType?: MatchType;
  minConfidence?: number;
  tags?: string[];
  setup?: () => void | Promise<void>;
  teardown?: () => void | Promise<void>;
  skip?: boolean;
  only?: boolean;
  timeout?: number;
}

type MatchType = 'exact' | 'contains' | 'fuzzy' | 'regex' | 'semantic';
```

**TestSuite:**

```typescript
interface TestSuite {
  name: string;
  description?: string;
  skill?: string;
  skillFile?: SkillFile;
  cases: TestCase[];
  tags?: string[];
  timeout?: number;
  beforeAll?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
  mock?: MockConfig;
}
```

**TestCaseResult:**

```typescript
interface TestCaseResult {
  name: string;
  passed: boolean;
  expected: boolean;
  actual: boolean;
  matchResult?: MatchResult;
  duration: number;
  error?: string;
  stack?: string;
  skipped?: boolean;
  skipReason?: string;
}
```

**TestSuiteResult:**

```typescript
interface TestSuiteResult {
  name: string;
  skillPath?: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestCaseResult[];
  errors: TestError[];
}
```

**MatchResult:**

```typescript
interface MatchResult {
  matched: boolean;
  trigger?: string;
  confidence: number;
  matchType: MatchType;
  details?: Record<string, unknown>;
}
```

### Coverage

```typescript
import {
  createCoverageCollector,
  generateCoverageReport,
  createCoverageReporter
} from '@skillbolt/test';

// Create coverage collector
const collector = createCoverageCollector();

// Run tests and collect coverage
const result = await runTests(coverageCollector);

// Get coverage report
const coverage = collector.getReport();

console.log('Trigger coverage:', coverage.triggerCoverage);
console.log('Section coverage:', coverage.sectionCoverage);

// Generate coverage report
const textReport = generateCoverageReport(coverage);

// Generate HTML report
const htmlReporter = createCoverageReporter('html');
await htmlReporter.generate(coverage, {
  output: './coverage/index.html'
});
```

**CoverageReport:**

```typescript
interface CoverageReport {
  triggerCoverage: TriggerCoverage[];
  sectionCoverage: SectionCoverage[];
}

interface TriggerCoverage {
  trigger: string;
  tested: boolean;
  testCount: number;
  lastTested?: Date;
}

interface SectionCoverage {
  section: string;
  tested: boolean;
  coverage: number; // 0-1
}
```

### Mock Functionality

```typescript
import {
  createMockProvider,
  createRecorder,
  loadRecording,
  recordResponses,
  replayResponses
} from '@skillbolt/test';

// Create Mock Provider
const mockProvider = createMockProvider({
  responses: {
    'git init': {
      role: 'assistant',
      content: 'Git repository initialized successfully.'
    }
  }
});

// Record responses
const recorder = createRecorder({
  outputPath: './recordings/git-workflow.json'
});
await recordResponses(skill, testCases, recorder);

// Load recording
const recording = await loadRecording('./recordings/git-workflow.json');

// Replay responses
const mockProvider = replayResponses(recording);
```

### Watch Mode

```typescript
import { createTestRunner } from '@skillbolt/test';

const runner = createTestRunner({
  skillPath: './skill.md',
  tests: testSuites
});

// Start watch mode
await runner.watch({
  onFileChange: (filePath) => {
    console.log(`File changed: ${filePath}`);
    runner.run();
  }
});
```

### Configuration

```typescript
import { loadTestConfig, defineConfig } from '@skillbolt/test';

// Load from file
const config = await loadTestConfig('./skill.test.config.json');

// Define configuration
const config = defineConfig({
  tests: testSuites,
  coverage: {
    enabled: true,
    output: './coverage'
  },
  watch: {
    enabled: true
  }
});
```

---

## Usage Examples

### Complete Lint Workflow

```typescript
import { Linter, getFormatter, loadLintConfig } from '@skillbolt/lint';
import { parseSkillFile } from '@skillbolt/core';

async function lintSkill(path: string) {
  // Load configuration
  const config = await loadLintConfig(process.cwd());

  // Create linter
  const linter = new Linter({ config });

  // Run lint
  const results = await linter.lintFile(path, { fix: true });

  // Format output
  const formatter = getFormatter('stylish');
  console.log(formatter(results));

  // Return exit code
  return results.some((r) => r.errorCount > 0) ? 1 : 0;
}
```

### Creating and Installing Skills

```typescript
import { initSkill } from '@skillbolt/init';
import { installSkill } from '@skillbolt/registry';

async function createAndInstall() {
  // Create skill
  const created = await initSkill({
    name: 'my-skill',
    description: 'My skill description',
    template: 'default',
  });

  // Install it
  const installed = await installSkill(created.path);

  console.log(`Installed ${installed.name}@${installed.version}`);
}
```

### Parsing and Validation

```typescript
import { parseSkillFile, ValidationError } from '@skillbolt/core';
import { Linter } from '@skillbolt/lint';

async function validateSkill(path: string) {
  // Parse
  const skill = await parseSkillFile(path);

  // Validate structure
  if (!skill.manifest.triggers?.length) {
    throw new ValidationError('At least one trigger is required');
  }

  // Lint
  const linter = new Linter();
  const results = await linter.lintFile(path);

  if (results[0].errorCount > 0) {
    throw new ValidationError('Lint errors found');
  }

  return skill;
}
```

### Workflow Execution

```typescript
import { parseWorkflowFile, executeWorkflow } from '@skillbolt/compose';

async function runWorkflow(workflowPath: string) {
  // Parse workflow
  const workflow = await parseWorkflowFile(workflowPath);

  // Execute workflow
  const result = await executeWorkflow(workflow, {
    skillExecutor: async (skillName, inputs, context) => {
      // Implement skill execution logic
      console.log(`Executing ${skillName} with inputs:`, inputs);
      return { output: 'success' };
    },
    onStepStart: (step) => {
      console.log(`Starting step: ${step.id}`);
    },
    onStepComplete: (step, result) => {
      console.log(`Completed step: ${step.id}`);
    }
  });

  console.log(`Workflow ${result.status} in ${result.duration}ms`);
  return result;
}
```

### Skill Analysis and Optimization

```typescript
import { createCollector, PatternAnalyzer, SuggestionGenerator } from '@skillbolt/analytics';

async function analyzeAndOptimize() {
  const collector = createCollector();
  
  // Get events from the last 30 days
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const events = collector.query({ startDate, endDate });
  const allSkills = collector.getUniqueSkills();

  // Analyze patterns
  const analyzer = new PatternAnalyzer(events);
  const patterns = analyzer.getTriggerPatterns();
  const unused = analyzer.getUnusedSkills(allSkills, 30);

  console.log('Top triggers:', patterns.slice(0, 10));
  console.log('Unused skills:', unused);

  // Generate suggestions
  const generator = new SuggestionGenerator(events, allSkills, []);
  const suggestions = generator.generate({ maxSuggestions: 10 });

  console.log('Suggestions:');
  suggestions.forEach(s => {
    console.log(`  [${s.priority}] ${s.suggestion} (${s.skillName})`);
  });

  collector.close();
}
```

### Skill Conversion and Sync

```typescript
import { convert, detectFormat } from '@skillbolt/convert';
import { SyncEngine } from '@skillbolt/sync';

async function convertAndSync(skillPath: string) {
  // Detect format
  const content = fs.readFileSync(skillPath, 'utf-8');
  const detected = detectFormat(content);
  console.log(`Detected format: ${detected.format}`);

  // Convert to all formats
  if (detected.format === 'claude') {
    const results = await convertToAll(content, './formats');
    console.log('Converted to:', results.map(r => r.format));
  }

  // Sync to cloud
  const syncEngine = new SyncEngine({
    backend: {
      type: 'github-gist',
      credentials: {
        token: process.env.GITHUB_TOKEN,
        gistId: process.env.GIST_ID
      }
    }
  });

  await syncEngine.push();
  console.log('Synced to cloud');
}