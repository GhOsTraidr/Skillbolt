export function validateSplitQuality(
  groups: Array<{ id: string; name: string; description: string; skills: { id: string }[] }>,
  totalSkills: number
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const avgSize = groups.length > 0 ? totalSkills / groups.length : 0;

  for (const group of groups) {
    if (group.skills.length === 0) {
      warnings.push(`Group ${group.id} has no skills.`);
    }
    if (avgSize > 0 && group.skills.length > avgSize * 2.5) {
      warnings.push(`Group ${group.id} is oversized relative to average.`);
    }
    if (group.skills.length === 1) {
      warnings.push(`Group ${group.id} has only one skill.`);
    }
    if (!group.description || group.description.trim().length === 0) {
      warnings.push(`Group ${group.id} is missing a description.`);
    }
  }

  const assignedIds = new Set<string>();
  for (const group of groups) {
    for (const skill of group.skills) {
      assignedIds.add(skill.id);
    }
  }
  const coverage = totalSkills === 0 ? 1 : assignedIds.size / totalSkills;
  if (coverage < 0.9) {
    warnings.push(`Only ${(coverage * 100).toFixed(1)}% of skills were assigned.`);
  }

  const hasEmptyGroups = groups.some((group) => group.skills.length === 0);
  const valid = coverage >= 0.9 && !hasEmptyGroups;

  return { valid, warnings };
}
