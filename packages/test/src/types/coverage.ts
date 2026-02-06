/**
 * Trigger coverage information
 */
export interface TriggerCoverage {
  /** Total number of triggers defined */
  total: number;
  /** Number of triggers tested */
  covered: number;
  /** Coverage percentage (0-100) */
  percentage: number;
  /** List of triggers that were tested */
  tested: string[];
  /** List of triggers that were not tested */
  untested: string[];
}

/**
 * Section coverage information
 */
export interface SectionCoverage {
  /** Section type */
  type: string;
  /** Section title */
  title: string;
  /** Whether the section was covered by tests */
  covered: boolean;
  /** Number of test cases that exercised this section */
  hitCount: number;
}

/**
 * Skill file coverage
 */
export interface SkillCoverage {
  /** Path to the skill file */
  path: string;
  /** Skill name */
  name: string;
  /** Trigger coverage */
  triggers: TriggerCoverage;
  /** Section coverage */
  sections: SectionCoverage[];
  /** Overall coverage percentage */
  overallPercentage: number;
}

/**
 * Complete coverage report
 */
export interface CoverageReport {
  /** Timestamp of report generation */
  timestamp: string;
  /** Summary statistics */
  summary: CoverageSummary;
  /** Per-skill coverage data */
  skills: SkillCoverage[];
  /** Whether coverage threshold was met */
  thresholdMet: boolean;
  /** Configured threshold */
  threshold: number;
}

/**
 * Coverage summary statistics
 */
export interface CoverageSummary {
  /** Total skills tested */
  totalSkills: number;
  /** Total triggers across all skills */
  totalTriggers: number;
  /** Total triggers covered */
  coveredTriggers: number;
  /** Overall trigger coverage percentage */
  triggerCoverage: number;
  /** Total sections across all skills */
  totalSections: number;
  /** Total sections covered */
  coveredSections: number;
  /** Overall section coverage percentage */
  sectionCoverage: number;
}

/**
 * Coverage collector state
 */
export interface CoverageCollectorState {
  /** Map of skill path to tested triggers */
  testedTriggers: Map<string, Set<string>>;
  /** Map of skill path to tested sections */
  testedSections: Map<string, Set<string>>;
  /** Skills that have been loaded */
  loadedSkills: Map<string, SkillCoverageData>;
}

/**
 * Internal skill data for coverage tracking
 */
export interface SkillCoverageData {
  /** Skill file path */
  path: string;
  /** Skill name */
  name: string;
  /** All triggers defined */
  triggers: string[];
  /** All section types */
  sections: Array<{ type: string; title: string }>;
}
