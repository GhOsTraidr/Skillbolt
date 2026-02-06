import { extractJSON } from '@skillbolt/core';

type SelectionItem = { id: string; reason: string };

function normalizeSelectionArray(value: unknown): SelectionItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: SelectionItem[] = [];

  for (const entry of value) {
    if (typeof entry === 'string') {
      items.push({ id: entry, reason: '' });
      continue;
    }

    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : null;
      if (!id) {
        continue;
      }
      const reason = typeof record.reason === 'string' ? record.reason : '';
      items.push({ id, reason });
    }
  }

  return items;
}

function filterValidSelections(items: SelectionItem[], validIds: string[]): SelectionItem[] {
  const validSet = new Set(validIds);
  const seen = new Set<string>();
  const filtered: SelectionItem[] = [];

  for (const item of items) {
    if (!validSet.has(item.id) || seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    filtered.push(item);
  }

  return filtered;
}

export function parseSelectionResponse(text: string, validIds: string[]): SelectionItem[] {
  const parsed = extractJSON<unknown>(text);
  if (!parsed) {
    return [];
  }

  let payload: unknown = parsed;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.selected)) {
      payload = record.selected;
    }
  }

  const normalized = normalizeSelectionArray(payload);
  return filterValidSelections(normalized, validIds);
}

export function parsePruneResponse(
  text: string,
  validIds: string[]
): { selected: SelectionItem[]; eliminated: SelectionItem[] } {
  const parsed = extractJSON<unknown>(text);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { selected: [], eliminated: [] };
  }

  const record = parsed as Record<string, unknown>;
  const selectedRaw = record.selected_skills;
  const eliminatedRaw = record.eliminated;

  const selected = filterValidSelections(normalizeSelectionArray(selectedRaw), validIds);
  const eliminated = filterValidSelections(normalizeSelectionArray(eliminatedRaw), validIds);

  return { selected, eliminated };
}
