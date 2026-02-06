/**
 * OpenClaw environment detection.
 * Checks if OpenClaw is installed, gateway is running, etc.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, platform } from 'node:os';
import { createConnection } from 'node:net';

export interface OpenClawEnvironment {
  /** Whether the openclaw CLI binary is found in PATH */
  installed: boolean;
  /** OpenClaw version string, or null if not installed */
  version: string | null;
  /** Whether the gateway WebSocket server is reachable */
  gatewayRunning: boolean;
  /** Gateway WebSocket URL */
  gatewayUrl: string;
  /** Path to ~/.openclaw/openclaw.json, or null if not found */
  configPath: string | null;
  /** Path to ~/.openclaw/workspace/skills/, or null if not found */
  skillsDir: string | null;
  /** Detected OS platform */
  platform: 'macos' | 'linux' | 'windows' | 'unknown';
}

const DEFAULT_GATEWAY_HOST = '127.0.0.1';
const DEFAULT_GATEWAY_PORT = 18789;

function detectPlatform(): OpenClawEnvironment['platform'] {
  const p = platform();
  if (p === 'darwin') return 'macos';
  if (p === 'linux') return 'linux';
  if (p === 'win32') return 'windows';
  return 'unknown';
}

function getOpenClawHome(): string {
  return join(homedir(), '.openclaw');
}

function checkInstalled(): { installed: boolean; version: string | null } {
  try {
    const output = execSync('openclaw --version', {
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8',
    }).trim();
    // Output may be like "openclaw 2026.1.30" or just "2026.1.30"
    const version = output.replace(/^openclaw\s*/i, '').trim() || output;
    return { installed: true, version };
  } catch {
    return { installed: false, version: null };
  }
}

function checkConfigPath(): string | null {
  const configPath = join(getOpenClawHome(), 'openclaw.json');
  return existsSync(configPath) ? configPath : null;
}

function checkSkillsDir(): string | null {
  const skillsDir = join(getOpenClawHome(), 'workspace', 'skills');
  return existsSync(skillsDir) ? skillsDir : null;
}

/**
 * Check if the OpenClaw gateway is reachable by attempting a TCP connection.
 */
function checkGatewayRunning(
  host: string = DEFAULT_GATEWAY_HOST,
  port: number = DEFAULT_GATEWAY_PORT,
  timeoutMs: number = 2000
): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.setTimeout(timeoutMs);
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * Detect the full OpenClaw environment state.
 */
export async function detectOpenClaw(options?: {
  gatewayHost?: string;
  gatewayPort?: number;
}): Promise<OpenClawEnvironment> {
  const host = options?.gatewayHost ?? DEFAULT_GATEWAY_HOST;
  const port = options?.gatewayPort ?? DEFAULT_GATEWAY_PORT;

  const { installed, version } = checkInstalled();
  const gatewayRunning = await checkGatewayRunning(host, port);

  return {
    installed,
    version,
    gatewayRunning,
    gatewayUrl: `ws://${host}:${port}`,
    configPath: checkConfigPath(),
    skillsDir: checkSkillsDir(),
    platform: detectPlatform(),
  };
}

/**
 * Quick check: is OpenClaw installed and available?
 */
export async function isOpenClawAvailable(): Promise<boolean> {
  const { installed } = checkInstalled();
  return installed;
}

/**
 * Get the OpenClaw skills directory path (whether or not it exists).
 */
export function getOpenClawSkillsDir(): string {
  return join(getOpenClawHome(), 'workspace', 'skills');
}

/**
 * Get the OpenClaw config file path (whether or not it exists).
 */
export function getOpenClawConfigPath(): string {
  return join(getOpenClawHome(), 'openclaw.json');
}
