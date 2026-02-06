import type { Message } from '../types/session.js';

export interface ProcessedMessage extends Message {
  turnIndex: number;
  hasToolCalls: boolean;
  hasCodeBlocks: boolean;
  codeBlocks: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface PreprocessResult {
  messages: ProcessedMessage[];
  totalTurns: number;
  toolCallCount: number;
}

const POSITIVE_SIGNALS = [
  'perfect',
  'great',
  'thanks',
  'good',
  'works',
  'done',
  '好的',
  '可以',
  '完成',
  '成功',
  '对的',
];

const NEGATIVE_SIGNALS = [
  'wrong',
  'error',
  'fail',
  "doesn't work",
  'not working',
  'not right',
  'undo',
  '不对',
  '错误',
  '失败',
  '撤销',
  '回滚',
];

export class ConversationPreprocessor {
  process(messages: Message[]): PreprocessResult {
    let turnIndex = 0;
    let toolCallCount = 0;

    const processed = messages.map((msg) => {
      if (msg.role === 'user') {
        turnIndex++;
      }

      const hasToolCalls = (msg.toolCalls?.length ?? 0) > 0;
      if (hasToolCalls && msg.toolCalls) {
        toolCallCount += msg.toolCalls.length;
      }

      const codeBlocks = this.extractCodeBlocks(msg.content);

      return {
        ...msg,
        turnIndex,
        hasToolCalls,
        hasCodeBlocks: codeBlocks.length > 0,
        codeBlocks,
        sentiment: this.analyzeSentiment(msg.content),
      };
    });

    return {
      messages: processed,
      totalTurns: turnIndex,
      toolCallCount,
    };
  }

  private extractCodeBlocks(content: string): string[] {
    const regex = /```[\w]*\n([\s\S]*?)```/g;
    const blocks: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      const block = match[1];
      if (block) {
        blocks.push(block.trim());
      }
    }

    return blocks;
  }

  private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const lower = content.toLowerCase();

    const hasPositive = POSITIVE_SIGNALS.some((s) => lower.includes(s));
    const hasNegative = NEGATIVE_SIGNALS.some((s) => lower.includes(s));

    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative) return 'negative';
    return 'neutral';
  }
}
