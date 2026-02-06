/**
 * JSON extraction utilities for parsing LLM responses.
 *
 * LLMs often wrap JSON in markdown code fences, explanatory text, etc.
 * These utilities handle all common formats.
 */

/**
 * Extract and parse JSON from LLM response text.
 *
 * Handles:
 * - Markdown code fences: ```json { ... } ```
 * - Bare JSON objects/arrays
 * - JSON embedded in prose text
 *
 * @returns Parsed JSON of type T, or null if extraction fails
 */
export function extractJSON<T>(text: string): T | null {
  if (!text || typeof text !== 'string') return null;

  const trimmed = text.trim();

  // 1. Try direct parse first (bare JSON)
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // continue to other strategies
  }

  // 2. Try extracting from markdown code fence
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // continue
    }
  }

  // 3. Try finding first { ... } or [ ... ] in text
  const jsonStart = findJsonBoundary(trimmed);
  if (jsonStart !== null) {
    try {
      return JSON.parse(jsonStart) as T;
    } catch {
      // continue
    }
  }

  return null;
}

/**
 * Extract a JSON array from LLM response text.
 * Supports both string arrays ["a", "b"] and object arrays [{...}, {...}].
 *
 * @returns Parsed array, or empty array if extraction fails
 */
export function extractJSONArray(text: string): unknown[] {
  const result = extractJSON<unknown>(text);

  if (Array.isArray(result)) {
    return result;
  }

  // If result is an object, look for array-valued properties
  if (result && typeof result === 'object') {
    for (const value of Object.values(result as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        return value;
      }
    }
  }

  return [];
}

/**
 * Find the boundaries of a JSON object or array in text.
 * Handles nested braces/brackets correctly.
 */
function findJsonBoundary(text: string): string | null {
  // Find first { or [
  let startChar: '{' | '[' | null = null;
  let endChar: '}' | ']' | null = null;
  let startIdx = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      startChar = '{';
      endChar = '}';
      startIdx = i;
      break;
    }
    if (text[i] === '[') {
      startChar = '[';
      endChar = ']';
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1 || !startChar || !endChar) return null;

  // Walk forward, counting nesting depth
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === startChar) depth++;
    if (ch === endChar) depth--;

    if (depth === 0) {
      return text.slice(startIdx, i + 1);
    }
  }

  return null;
}
