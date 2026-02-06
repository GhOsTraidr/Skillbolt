/**
 * @skillbolt/openclaw
 *
 * OpenClaw integration for Skillbolt.
 * Manage, search, and execute skills via the OpenClaw gateway.
 */

// Detection
export {
  detectOpenClaw,
  isOpenClawAvailable,
  getOpenClawSkillsDir,
  getOpenClawConfigPath,
} from './detect.js';
export type { OpenClawEnvironment } from './detect.js';

// Config
export {
  resolveOpenClawConfig,
  DEFAULT_OPENCLAW_CONFIG,
} from './config.js';
export type { OpenClawIntegrationConfig } from './config.js';

// Client
export { OpenClawGatewayClient } from './client/gateway-client.js';
export { OpenClawAgentClient } from './client/agent-client.js';
export type {
  GatewayClientOptions,
  GatewayStatus,
  ChannelInfo,
  GatewayMessage,
  OpenClawAgentClientOptions,
  RPCRequest,
  RPCResponse,
} from './client/types.js';

// Visualizer
export { ChannelVisualizer } from './visualizer/channel-visualizer.js';
export type { ChannelVisualizerOptions } from './visualizer/channel-visualizer.js';

// Converter
export { openclawToSkillbolt, skillKitToOpenClaw, parseOpenClawFrontmatter } from './converter/parser.js';
export type { OpenClawSkillFrontmatter } from './converter/parser.js';

// Skill Sync
export { pushSkills } from './skill-sync/push.js';
export type { PushOptions, PushResult } from './skill-sync/push.js';
export { pullSkills } from './skill-sync/pull.js';
export type { PullOptions, PullResult } from './skill-sync/pull.js';

// Analytics
export { toExecutionMetrics } from './analytics.js';
export type { OpenClawExecutionEvent } from './analytics.js';
