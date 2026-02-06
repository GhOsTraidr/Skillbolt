/**
 * @skillbolt/convert - Type Definitions
 *
 * Core types for the format converter module
 */

/**
 * Supported skill format types
 */
export type Format = 'claude' | 'codex' | 'cursor' | 'continue' | 'openclaw';

/**
 * All supported formats as a constant array
 */
export const ALL_FORMATS: Format[] = [
  'claude',
  'codex',
  'cursor',
  'continue',
  'openclaw',
];

/**
 * A parsed section from any skill format
 */
export interface ParsedSection {
  /** Section name/title */
  name: string;
  /** Section content (body text) */
  content: string;
  /** Heading level (1 = h1, 2 = h2, etc.) */
  level: number;
}

/**
 * Unified parsed skill representation
 * This is the intermediate format used for all conversions
 */
export interface ParsedSkill {
  /** Skill metadata */
  metadata: SkillMetadata;
  /** Markdown sections */
  sections: ParsedSection[];
  /** Original raw content */
  rawContent: string;
}

/**
 * Skill metadata fields that can exist across formats
 */
export interface SkillMetadata {
  /** Skill name */
  name: string;
  /** Skill description */
  description: string;
  /** Version string (Claude-specific) */
  version?: string;
  /** Model to use (Codex-specific) */
  model?: string;
  /** Trigger phrases (Claude-specific) */
  triggers?: string[];
  /** Author information */
  author?: string;
  /** Additional arbitrary fields */
  [key: string]: unknown;
}

/**
 * Options for convert operations
 */
export interface ConvertOptions {
  /** Target format(s) */
  to: Format | 'all';
  /** Output directory (defaults to same directory as input) */
  output?: string;
  /** Overwrite existing files */
  overwrite?: boolean;
  /** Preserve source file */
  preserveSource?: boolean;
}

/**
 * Result of a single conversion operation
 */
export interface ConvertResult {
  /** Detected source format */
  source: Format;
  /** Target format */
  target: Format;
  /** Input file path */
  inputPath: string;
  /** Output file path */
  outputPath: string;
  /** Whether conversion succeeded */
  success: boolean;
  /** Warning messages for lossy conversions */
  warnings?: string[];
  /** Error message if failed */
  error?: string;
}

/**
 * Result of format detection
 */
export interface DetectResult {
  /** Detected format */
  format: Format;
  /** Confidence score (0-100) */
  confidence: number;
  /** Indicators that led to this detection */
  indicators: string[];
}

/**
 * Result of conversion with content and warnings
 */
export interface ConversionOutput {
  /** Converted content string */
  content: string;
  /** Warnings about lossy conversion */
  warnings: string[];
}

/**
 * Options for batch conversion
 */
export interface BatchConvertOptions extends ConvertOptions {
  /** Glob pattern for files to include */
  pattern?: string;
  /** Whether to process recursively */
  recursive?: boolean;
  /** Maximum concurrent conversions */
  concurrency?: number;
}

/**
 * Summary of batch conversion results
 */
export interface BatchConvertSummary {
  /** Total files processed */
  total: number;
  /** Successful conversions */
  success: number;
  /** Failed conversions */
  failed: number;
  /** Individual results */
  results: ConvertResult[];
}

/**
 * Converter interface - all converters must implement this
 */
export interface Converter {
  /** Source format this converter handles */
  readonly sourceFormat: Format;
  /** Target format this converter produces */
  readonly targetFormat: Format;

  /**
   * Convert a parsed skill to target format
   * @param skill - The parsed skill to convert
   * @returns Converted content string
   */
  convert(skill: ParsedSkill): string;

  /**
   * Convert with detailed warnings
   * @param skill - The parsed skill to convert
   * @returns Content and warnings
   */
  convertWithWarnings(skill: ParsedSkill): ConversionOutput;
}

/**
 * Parser interface - all parsers must implement this
 */
export interface Parser {
  /** Format this parser handles */
  readonly format: Format;

  /**
   * Parse content string into unified format
   * @param content - Raw content string
   * @returns Parsed skill object
   */
  parse(content: string): ParsedSkill;

  /**
   * Check if content matches this format
   * @param content - Raw content string
   * @returns Whether content appears to be this format
   */
  canParse(content: string): boolean;
}
