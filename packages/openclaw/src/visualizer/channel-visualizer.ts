/**
 * VisualizerProtocol implementation that sends execution progress
 * to an OpenClaw messaging channel (Telegram, Discord, etc.).
 *
 * Includes message throttling to avoid flooding the channel.
 */

import type { VisualizerProtocol } from '@skillbolt/execute';
import { OpenClawGatewayClient } from '../client/gateway-client.js';

export interface ChannelVisualizerOptions {
  /** Gateway client instance */
  gateway: OpenClawGatewayClient;
  /** Target channel (e.g., "telegram", "discord") */
  channel: string;
  /** Target peer ID (user or group) */
  peerId: string;
  /** Minimum interval between messages in ms (default: 2000) */
  throttleMs?: number;
}

export class ChannelVisualizer implements VisualizerProtocol {
  private gateway: OpenClawGatewayClient;
  private channel: string;
  private peerId: string;
  private throttleMs: number;
  private lastSendTime = 0;
  private pendingMessage: string | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private statusMap: Map<string, string> = new Map();

  constructor(options: ChannelVisualizerOptions) {
    this.gateway = options.gateway;
    this.channel = options.channel;
    this.peerId = options.peerId;
    this.throttleMs = options.throttleMs ?? 2000;
  }

  async setTask(task: string): Promise<void> {
    await this.send(`🚀 *Task started*\n${task}`);
  }

  async setNodes(
    nodes: Parameters<VisualizerProtocol['setNodes']>[0],
    phases: Parameters<VisualizerProtocol['setNodes']>[1]
  ): Promise<void> {
    const totalNodes = nodes.length;
    const totalPhases = phases.length;
    await this.send(`📋 Plan: ${totalNodes} skills in ${totalPhases} phase(s)`);
  }

  async updateStatus(nodeId: string, status: string): Promise<void> {
    this.statusMap.set(nodeId, status);

    const icon = status === 'completed' ? '✅'
      : status === 'failed' ? '❌'
      : status === 'running' ? '⏳'
      : status === 'skipped' ? '⏭️'
      : '⏸️';

    await this.throttledSend(`${icon} ${nodeId}: ${status}`);
  }

  async setPhase(phaseNum: number): Promise<void> {
    await this.send(`\n📌 *Phase ${phaseNum}*`);
  }

  async addLog(message: string, level?: string, _nodeId?: string): Promise<void> {
    if (level === 'error') {
      await this.send(`⚠️ ${message}`);
    }
    // Only send errors to channel to avoid spam; other logs are silent
  }

  async selectPlan(plans: Record<string, unknown>[]): Promise<number> {
    // In channel mode, auto-select first plan (no interactive selection)
    if (plans.length > 1) {
      await this.send(`📊 ${plans.length} plans generated. Auto-selecting plan 1.`);
    }
    return 0;
  }

  // --- Internal ---

  private async send(text: string): Promise<void> {
    if (!this.gateway.connected) return;

    try {
      await this.gateway.sendMessage({
        channel: this.channel,
        to: this.peerId,
        text,
      });
      this.lastSendTime = Date.now();
    } catch {
      // Silently ignore send failures — don't break execution
    }
  }

  private async throttledSend(text: string): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastSendTime;

    if (elapsed >= this.throttleMs) {
      // Include any pending message
      if (this.pendingMessage) {
        const combined = `${this.pendingMessage}\n${text}`;
        this.pendingMessage = null;
        if (this.pendingTimer) {
          clearTimeout(this.pendingTimer);
          this.pendingTimer = null;
        }
        await this.send(combined);
      } else {
        await this.send(text);
      }
    } else {
      // Buffer the message
      this.pendingMessage = this.pendingMessage
        ? `${this.pendingMessage}\n${text}`
        : text;

      if (!this.pendingTimer) {
        this.pendingTimer = setTimeout(async () => {
          const msg = this.pendingMessage;
          this.pendingMessage = null;
          this.pendingTimer = null;
          if (msg) await this.send(msg);
        }, this.throttleMs - elapsed);
      }
    }
  }
}
