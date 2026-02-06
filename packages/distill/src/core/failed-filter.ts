import type { ProcessedMessage } from './preprocessor.js';

export interface FilterResult {
  messages: ProcessedMessage[];
  removedCount: number;
  removedTurns: number[];
}

const FAILURE_INDICATORS = {
  userSignals: [
    'not working',
    "doesn't work",
    'wrong',
    'undo',
    'revert',
    'go back',
    'try again',
    "that's not right",
    'actually',
    '不对',
    '撤销',
    '回滚',
    '重试',
    '换个方法',
  ],
  assistantSignals: [
    'sorry',
    'apologize',
    'my mistake',
    'let me try again',
    'I made an error',
    'that was incorrect',
    '抱歉',
    '对不起',
    '我的错误',
    '让我重试',
  ],
  toolFailures: ['error', 'failed', 'exception', 'not found', 'permission denied'],
};

export class FailedAttemptFilter {
  filter(messages: ProcessedMessage[]): FilterResult {
    const failedTurns = this.identifyFailedTurns(messages);

    const filtered = messages.filter((msg) => !failedTurns.has(msg.turnIndex));

    return {
      messages: filtered,
      removedCount: messages.length - filtered.length,
      removedTurns: Array.from(failedTurns),
    };
  }

  private identifyFailedTurns(messages: ProcessedMessage[]): Set<number> {
    const failedTurns = new Set<number>();

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const nextMsg = messages[i + 1];

      if (!msg) continue;

      if (msg.role === 'user' && this.hasFailureSignal(msg.content, 'userSignals')) {
        if (msg.turnIndex > 1) {
          failedTurns.add(msg.turnIndex - 1);
        }
      }

      if (msg.role === 'assistant' && this.hasFailureSignal(msg.content, 'assistantSignals')) {
        failedTurns.add(msg.turnIndex);
      }

      if (msg.toolResults?.some((r) => !r.success)) {
        failedTurns.add(msg.turnIndex);
      }

      if (msg.toolResults?.some((r) => this.hasFailureSignal(r.output, 'toolFailures'))) {
        failedTurns.add(msg.turnIndex);
      }

      if (msg.role === 'user' && nextMsg?.role === 'user') {
        failedTurns.add(msg.turnIndex);
      }
    }

    return failedTurns;
  }

  private hasFailureSignal(content: string, signalType: keyof typeof FAILURE_INDICATORS): boolean {
    const lower = content.toLowerCase();
    return FAILURE_INDICATORS[signalType].some((signal) => lower.includes(signal.toLowerCase()));
  }
}
