import { describe, it, expect } from 'vitest';
import { ConversationPreprocessor } from '../../../src/core/preprocessor.js';
import { createMockMessage } from '../../fixtures/sessions.js';

describe('ConversationPreprocessor', () => {
  const preprocessor = new ConversationPreprocessor();

  describe('process', () => {
    it('should count turns correctly', () => {
      const messages = [
        createMockMessage({ role: 'user', content: 'First message' }),
        createMockMessage({ role: 'assistant', content: 'Response' }),
        createMockMessage({ role: 'user', content: 'Second message' }),
        createMockMessage({ role: 'assistant', content: 'Another response' }),
      ];

      const result = preprocessor.process(messages);

      expect(result.totalTurns).toBe(2);
      expect(result.messages[0].turnIndex).toBe(1);
      expect(result.messages[2].turnIndex).toBe(2);
    });

    it('should count tool calls', () => {
      const messages = [
        createMockMessage({ role: 'user', content: 'Do something' }),
        createMockMessage({
          role: 'assistant',
          content: 'Done',
          toolCalls: [
            { name: 'tool1', input: {} },
            { name: 'tool2', input: {} },
          ],
        }),
      ];

      const result = preprocessor.process(messages);

      expect(result.toolCallCount).toBe(2);
      expect(result.messages[1].hasToolCalls).toBe(true);
    });

    it('should extract code blocks', () => {
      const messages = [
        createMockMessage({
          role: 'assistant',
          content:
            'Here is the code:\n```javascript\nconsole.log("hello");\n```\nAnd more:\n```typescript\nconst x = 1;\n```',
        }),
      ];

      const result = preprocessor.process(messages);

      expect(result.messages[0].hasCodeBlocks).toBe(true);
      expect(result.messages[0].codeBlocks).toHaveLength(2);
      expect(result.messages[0].codeBlocks[0]).toBe('console.log("hello");');
    });

    it('should analyze sentiment correctly', () => {
      const positiveMessage = createMockMessage({
        role: 'user',
        content: 'Perfect, that works great!',
      });
      const negativeMessage = createMockMessage({
        role: 'user',
        content: 'That is wrong, undo it',
      });
      const neutralMessage = createMockMessage({ role: 'user', content: 'Show me the file' });

      const positiveResult = preprocessor.process([positiveMessage]);
      const negativeResult = preprocessor.process([negativeMessage]);
      const neutralResult = preprocessor.process([neutralMessage]);

      expect(positiveResult.messages[0].sentiment).toBe('positive');
      expect(negativeResult.messages[0].sentiment).toBe('negative');
      expect(neutralResult.messages[0].sentiment).toBe('neutral');
    });
  });
});
