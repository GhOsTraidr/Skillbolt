import { getAllCommands } from './loader.js';

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1
        );
      }
    }
  }

  return matrix[b.length]![a.length]!;
}

export function suggestCommand(input: string, maxSuggestions = 3): string[] {
  const commands = getAllCommands();
  const suggestions: Array<{ command: string; distance: number }> = [];

  for (const cmd of commands) {
    const distance = levenshteinDistance(input.toLowerCase(), cmd.toLowerCase());
    if (distance <= 3) {
      suggestions.push({ command: cmd, distance });
    }
  }

  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxSuggestions)
    .map((s) => s.command);
}

export function formatSuggestions(suggestions: string[]): string {
  if (suggestions.length === 0) {
    return '';
  }

  if (suggestions.length === 1) {
    return `Did you mean "${suggestions[0]}"?`;
  }

  const formatted = suggestions.map((s) => `"${s}"`).join(', ');
  return `Did you mean one of: ${formatted}?`;
}
