import { describe, it, expect } from 'vitest';
import { FailedAttemptFilter } from '../../../src/core/failed-filter.js';
import { ConversationPreprocessor } from '../../../src/core/preprocessor.js';
import { createMockMessage, createFailedAttemptSession } from '../../fixtures/sessions.js';

describe('FailedAttemptFilter', () => {
  const filter = new FailedAttemptFilter();
  const preprocessor = new ConversationPreprocessor();

  describe('filter', () => {
    it('should remove turns where user says "wrong"', () => {
      const messages = [
        createMockMessage({ role: 'user', content: 'Create a function' }),
        createMockMessage({ role: 'assistant', content: 'Here it is...' }),
        createMockMessage({ role: 'user', content: 'That is wrong' }),
        createMockMessage({ role: 'assistant', content: 'Sorry, fixed...' }),
        createMockMessage({ role: 'user', content: 'Perfect!' }),
      ];

      const processed = preprocessor.process(messages);
      const result = filter.filter(processed.messages);

      expect(result.removedCount).toBeGreaterThan(0);
    });

    it('should remove turns with assistant apologies', () => {
      const messages = [
        createMockMessage({ role: 'user', content: 'Do something' }),
        createMockMessage({
          role: 'assistant',
          content: 'Sorry, I made an error. Let me fix that.',
        }),
        createMockMessage({ role: 'assistant', content: 'Here is the correct version.' }),
      ];

      const processed = preprocessor.process(messages);
      const result = filter.filter(processed.messages);

      expect(result.removedCount).toBeGreaterThan(0);
    });

    it('should handle session with failed attempts', () => {
      const session = createFailedAttemptSession();
      const processed = preprocessor.process(session.messages);
      const result = filter.filter(processed.messages);

      expect(result.removedCount).toBeGreaterThan(0);
      expect(result.messages.length).toBeLessThan(session.messages.length);
    });

    it('should preserve successful messages', () => {
      const messages = [
        createMockMessage({ role: 'user', content: 'Create something' }),
        createMockMessage({ role: 'assistant', content: 'Done!' }),
        createMockMessage({ role: 'user', content: 'Perfect, thanks!' }),
      ];

      const processed = preprocessor.process(messages);
      const result = filter.filter(processed.messages);

      expect(result.messages.length).toBe(messages.length);
      expect(result.removedCount).toBe(0);
    });
  });
});
