import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('node:net', () => ({
  createConnection: vi.fn(),
}));

vi.mock('node:os', () => ({
  homedir: vi.fn(() => '/mock/home'),
  platform: vi.fn(() => 'darwin'),
}));

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createConnection } from 'node:net';
import { platform } from 'node:os';
import { detectOpenClaw, isOpenClawAvailable, getOpenClawSkillsDir, getOpenClawConfigPath } from './detect.js';

const mockExecSync = vi.mocked(execSync);
const mockExistsSync = vi.mocked(existsSync);
const mockCreateConnection = vi.mocked(createConnection);
const mockPlatform = vi.mocked(platform);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('detectOpenClaw', () => {
  function setupSocket(connected: boolean) {
    const socket = {
      destroy: vi.fn(),
      setTimeout: vi.fn(),
      on: vi.fn(),
    };
    mockCreateConnection.mockImplementation((_opts: unknown, cb?: () => void) => {
      if (connected && cb) setTimeout(cb, 0);
      else setTimeout(() => {
        const errorHandler = socket.on.mock.calls.find((c) => c[0] === 'error');
        if (errorHandler) (errorHandler[1] as () => void)();
      }, 0);
      return socket as unknown as ReturnType<typeof createConnection>;
    });
    return socket;
  }

  it('detects installed openclaw with version', async () => {
    mockExecSync.mockReturnValue('openclaw 2026.1.30');
    mockExistsSync.mockReturnValue(false);
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.installed).toBe(true);
    expect(env.version).toBe('2026.1.30');
  });

  it('detects uninstalled openclaw', async () => {
    mockExecSync.mockImplementation(() => { throw new Error('not found'); });
    mockExistsSync.mockReturnValue(false);
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.installed).toBe(false);
    expect(env.version).toBeNull();
  });

  it('detects config path when exists', async () => {
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockImplementation((p) =>
      String(p).endsWith('openclaw.json')
    );
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.configPath).toContain('openclaw.json');
  });

  it('returns null configPath when missing', async () => {
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockReturnValue(false);
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.configPath).toBeNull();
  });

  it('detects skills directory when exists', async () => {
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockImplementation((p) =>
      String(p).endsWith('skills')
    );
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.skillsDir).toContain('skills');
  });

  it('detects gateway running', async () => {
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockReturnValue(false);
    setupSocket(true);

    const env = await detectOpenClaw();
    expect(env.gatewayRunning).toBe(true);
  });

  it('detects gateway not running', async () => {
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockReturnValue(false);
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.gatewayRunning).toBe(false);
  });

  it('builds correct gateway URL from options', async () => {
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockReturnValue(false);
    setupSocket(false);

    const env = await detectOpenClaw({ gatewayHost: '10.0.0.1', gatewayPort: 9999 });
    expect(env.gatewayUrl).toBe('ws://10.0.0.1:9999');
  });

  it('maps darwin platform to macos', async () => {
    mockPlatform.mockReturnValue('darwin');
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockReturnValue(false);
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.platform).toBe('macos');
  });

  it('maps linux platform', async () => {
    mockPlatform.mockReturnValue('linux');
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockReturnValue(false);
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.platform).toBe('linux');
  });

  it('maps win32 platform to windows', async () => {
    mockPlatform.mockReturnValue('win32');
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockReturnValue(false);
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.platform).toBe('windows');
  });

  it('maps unknown platform', async () => {
    mockPlatform.mockReturnValue('freebsd' as NodeJS.Platform);
    mockExecSync.mockReturnValue('2026.1.30');
    mockExistsSync.mockReturnValue(false);
    setupSocket(false);

    const env = await detectOpenClaw();
    expect(env.platform).toBe('unknown');
  });
});

describe('isOpenClawAvailable', () => {
  it('returns true when installed', async () => {
    mockExecSync.mockReturnValue('2026.1.30');
    expect(await isOpenClawAvailable()).toBe(true);
  });

  it('returns false when not installed', async () => {
    mockExecSync.mockImplementation(() => { throw new Error('not found'); });
    expect(await isOpenClawAvailable()).toBe(false);
  });
});

describe('getOpenClawSkillsDir', () => {
  it('returns expected path', () => {
    expect(getOpenClawSkillsDir()).toContain('skills');
  });
});

describe('getOpenClawConfigPath', () => {
  it('returns expected path', () => {
    expect(getOpenClawConfigPath()).toContain('openclaw.json');
  });
});
