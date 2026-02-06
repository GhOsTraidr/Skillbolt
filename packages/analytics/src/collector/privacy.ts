import type { AnalyticsEventInput, PrivacyLevel } from '../types/index.js';

export function applyPrivacyFilter(
  input: AnalyticsEventInput,
  level: PrivacyLevel
): AnalyticsEventInput {
  if (level === 'off') {
    throw new Error('Analytics collection is disabled');
  }

  if (level === 'high') {
    return input;
  }

  if (level === 'medium') {
    return {
      ...input,
      parameters: input.parameters ? sanitizeParameters(input.parameters) : undefined,
    };
  }

  return {
    skillName: input.skillName,
    eventType: input.eventType,
    duration: input.duration,
    success: input.success,
    errorCode: input.errorCode,
  };
}

function sanitizeParameters(params: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      sanitized[key] = value.length > 100 ? `[${value.length} chars]` : value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = `[Array: ${value.length} items]`;
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = '[Object]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function isCollectionEnabled(level: PrivacyLevel): boolean {
  return level !== 'off';
}
