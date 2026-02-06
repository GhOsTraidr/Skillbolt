import { describe, it, expect } from 'vitest';
import { resolveOpenClawConfig, DEFAULT_OPENCLAW_CONFIG } from './config.js';

describe('resolveOpenClawConfig', () => {
  it('returns defaults when no config provided', () => {
    const config = resolveOpenClawConfig();
    expect(config).toEqual(DEFAULT_OPENCLAW_CONFIG);
  });

  it('returns defaults when config has no openclaw key', () => {
    const config = resolveOpenClawConfig({ name: 'test' } as never);
    expect(config).toEqual(DEFAULT_OPENCLAW_CONFIG);
  });

  it('merges partial openclaw config with defaults', () => {
    const config = resolveOpenClawConfig({
      openclaw: { autoSync: true, costTracking: false },
    } as never);
    expect(config.autoSync).toBe(true);
    expect(config.costTracking).toBe(false);
    expect(config.enabled).toBe(true);
    expect(config.gatewayUrl).toBe('ws://127.0.0.1:18789');
  });

  it('overrides gatewayUrl', () => {
    const config = resolveOpenClawConfig({
      openclaw: { gatewayUrl: 'ws://10.0.0.1:9999' },
    } as never);
    expect(config.gatewayUrl).toBe('ws://10.0.0.1:9999');
  });

  it('overrides skillsDir', () => {
    const config = resolveOpenClawConfig({
      openclaw: { skillsDir: '/custom/skills' },
    } as never);
    expect(config.skillsDir).toBe('/custom/skills');
  });

  it('overrides defaultAgent', () => {
    const config = resolveOpenClawConfig({
      openclaw: { defaultAgent: 'my-agent' },
    } as never);
    expect(config.defaultAgent).toBe('my-agent');
  });

  it('overrides enabled to false', () => {
    const config = resolveOpenClawConfig({
      openclaw: { enabled: false },
    } as never);
    expect(config.enabled).toBe(false);
  });

  it('returns a new object each call (no shared references)', () => {
    const a = resolveOpenClawConfig();
    const b = resolveOpenClawConfig();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe('DEFAULT_OPENCLAW_CONFIG', () => {
  it('has expected default values', () => {
    expect(DEFAULT_OPENCLAW_CONFIG.enabled).toBe(true);
    expect(DEFAULT_OPENCLAW_CONFIG.gatewayUrl).toBe('ws://127.0.0.1:18789');
    expect(DEFAULT_OPENCLAW_CONFIG.autoSync).toBe(false);
    expect(DEFAULT_OPENCLAW_CONFIG.skillsDir).toBe('~/.openclaw/workspace/skills');
    expect(DEFAULT_OPENCLAW_CONFIG.defaultAgent).toBe('default');
    expect(DEFAULT_OPENCLAW_CONFIG.costTracking).toBe(true);
  });
});
