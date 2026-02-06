import type {
  CoverageCollectorState,
  SkillCoverageData,
  TriggerCoverage,
  SectionCoverage,
  SkillCoverage,
  CoverageReport,
  CoverageSummary,
} from '../types/index.js';
import type { SkillFile } from '@skillbolt/core';

export interface CoverageCollector {
  registerSkill(skillFile: SkillFile): void;
  recordTriggerTest(skillPath: string, trigger: string): void;
  recordSectionTest(skillPath: string, sectionType: string): void;
  getReport(threshold?: number): CoverageReport;
  getSkillCoverage(skillPath: string): SkillCoverage | null;
  reset(): void;
}

export function createCoverageCollector(): CoverageCollector {
  const state: CoverageCollectorState = {
    testedTriggers: new Map(),
    testedSections: new Map(),
    loadedSkills: new Map(),
  };

  function registerSkill(skillFile: SkillFile): void {
    const data: SkillCoverageData = {
      path: skillFile.path,
      name: skillFile.manifest.name,
      triggers: skillFile.manifest.triggers ?? [],
      sections: skillFile.sections.map((s) => ({ type: s.type, title: s.title })),
    };

    state.loadedSkills.set(skillFile.path, data);
    state.testedTriggers.set(skillFile.path, new Set());
    state.testedSections.set(skillFile.path, new Set());
  }

  function recordTriggerTest(skillPath: string, trigger: string): void {
    const triggers = state.testedTriggers.get(skillPath);
    if (triggers) {
      triggers.add(trigger);
    }
  }

  function recordSectionTest(skillPath: string, sectionType: string): void {
    const sections = state.testedSections.get(skillPath);
    if (sections) {
      sections.add(sectionType);
    }
  }

  function calculateTriggerCoverage(skillData: SkillCoverageData): TriggerCoverage {
    const testedSet = state.testedTriggers.get(skillData.path) ?? new Set();
    const total = skillData.triggers.length;
    const covered = skillData.triggers.filter((t) => testedSet.has(t)).length;
    const percentage = total === 0 ? 100 : (covered / total) * 100;

    return {
      total,
      covered,
      percentage,
      tested: Array.from(testedSet),
      untested: skillData.triggers.filter((t) => !testedSet.has(t)),
    };
  }

  function calculateSectionCoverage(skillData: SkillCoverageData): SectionCoverage[] {
    const testedSet = state.testedSections.get(skillData.path) ?? new Set();

    return skillData.sections.map((section) => ({
      type: section.type,
      title: section.title,
      covered: testedSet.has(section.type),
      hitCount: testedSet.has(section.type) ? 1 : 0,
    }));
  }

  function getSkillCoverage(skillPath: string): SkillCoverage | null {
    const skillData = state.loadedSkills.get(skillPath);
    if (!skillData) return null;

    const triggers = calculateTriggerCoverage(skillData);
    const sections = calculateSectionCoverage(skillData);

    const sectionsCovered = sections.filter((s) => s.covered).length;
    const sectionsTotal = sections.length;
    const sectionPercentage = sectionsTotal === 0 ? 100 : (sectionsCovered / sectionsTotal) * 100;

    const overallPercentage = (triggers.percentage + sectionPercentage) / 2;

    return {
      path: skillPath,
      name: skillData.name,
      triggers,
      sections,
      overallPercentage,
    };
  }

  function getReport(threshold = 80): CoverageReport {
    const skills: SkillCoverage[] = [];

    for (const skillPath of state.loadedSkills.keys()) {
      const coverage = getSkillCoverage(skillPath);
      if (coverage) {
        skills.push(coverage);
      }
    }

    const summary = calculateSummary(skills);
    const thresholdMet = summary.triggerCoverage >= threshold;

    return {
      timestamp: new Date().toISOString(),
      summary,
      skills,
      thresholdMet,
      threshold,
    };
  }

  function calculateSummary(skills: SkillCoverage[]): CoverageSummary {
    let totalTriggers = 0;
    let coveredTriggers = 0;
    let totalSections = 0;
    let coveredSections = 0;

    for (const skill of skills) {
      totalTriggers += skill.triggers.total;
      coveredTriggers += skill.triggers.covered;
      totalSections += skill.sections.length;
      coveredSections += skill.sections.filter((s) => s.covered).length;
    }

    return {
      totalSkills: skills.length,
      totalTriggers,
      coveredTriggers,
      triggerCoverage: totalTriggers === 0 ? 100 : (coveredTriggers / totalTriggers) * 100,
      totalSections,
      coveredSections,
      sectionCoverage: totalSections === 0 ? 100 : (coveredSections / totalSections) * 100,
    };
  }

  function reset(): void {
    state.testedTriggers.clear();
    state.testedSections.clear();
    state.loadedSkills.clear();
  }

  return {
    registerSkill,
    recordTriggerTest,
    recordSectionTest,
    getReport,
    getSkillCoverage,
    reset,
  };
}

export function collectCoverage(
  skillFiles: SkillFile[],
  testedTriggers: Map<string, string[]>
): CoverageReport {
  const collector = createCoverageCollector();

  for (const skill of skillFiles) {
    collector.registerSkill(skill);

    const triggers = testedTriggers.get(skill.path) ?? [];
    for (const trigger of triggers) {
      collector.recordTriggerTest(skill.path, trigger);
    }
  }

  return collector.getReport();
}

export function calculateTriggerCoverage(
  allTriggers: string[],
  testedTriggers: string[]
): TriggerCoverage {
  const testedSet = new Set(testedTriggers);
  const total = allTriggers.length;
  const covered = allTriggers.filter((t) => testedSet.has(t)).length;
  const percentage = total === 0 ? 100 : (covered / total) * 100;

  return {
    total,
    covered,
    percentage,
    tested: testedTriggers,
    untested: allTriggers.filter((t) => !testedSet.has(t)),
  };
}
