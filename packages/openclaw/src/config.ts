/**
 * OpenClaw integration configuration.
 * Reads from Skillbolt config (openclaw section) and provides defaults.
 */

import type { SkillboltConfig } from '@skillbolt/core';

export interface OpenClawIntegrationConfig {
  /** Whether OpenClaw integration is enabled */
  enabled: boolean;
  /** Gateway WebSocket URL */
  gatewayUrl: string;
  /** Whether to auto-sync skills on push/pull */
  autoSync: boolean;
  /** OpenClaw skills directory override */
  skillsDir: string;
  /** Default agent ID for execution */
  defaultAgent: string;
  /** Whether to track execution costs */
  costTracking: boolean;
}

const DEFAULT_OPENCLAW_CONFIG: OpenClawIntegrationConfig = {
  enabled: true,
  gatewayUrl: 'ws://127.0.0.1:18789',
  autoSync: false,
  skillsDir: '~/.openclaw/workspace/skills',
  defaultAgent: 'default',
  costTracking: true,
};

/**
 * Resolve OpenClaw integration config from Skillbolt config.
 * Falls back to defaults for any missing fields.
 */
export function resolveOpenClawConfig(
  skillKitConfig?: SkillboltConfig
): OpenClawIntegrationConfig {
  const raw = (skillKitConfig as Record<string, unknown>)?.openclaw as
    | Partial<OpenClawIntegrationConfig>
    | undefined;

  if (!raw) {
    return { ...DEFAULT_OPENCLAW_CONFIG };
  }

  return {
    enabled: raw.enabled ?? DEFAULT_OPENCLAW_CONFIG.enabled,
    gatewayUrl: raw.gatewayUrl ?? DEFAULT_OPENCLAW_CONFIG.gatewayUrl,
    autoSync: raw.autoSync ?? DEFAULT_OPENCLAW_CONFIG.autoSync,
    skillsDir: raw.skillsDir ?? DEFAULT_OPENCLAW_CONFIG.skillsDir,
    defaultAgent: raw.defaultAgent ?? DEFAULT_OPENCLAW_CONFIG.defaultAgent,
    costTracking: raw.costTracking ?? DEFAULT_OPENCLAW_CONFIG.costTracking,
  };
}

export { DEFAULT_OPENCLAW_CONFIG };
