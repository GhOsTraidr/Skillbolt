import { describe, it, expect } from 'vitest';
import { TEMPLATE_CHOICES, PLATFORM_CHOICES, DEFAULTS } from '../../src/types.js';

describe('types', () => {
  describe('TEMPLATE_CHOICES', () => {
    it('should have three template options', () => {
      expect(TEMPLATE_CHOICES).toHaveLength(3);
    });

    it('should include minimal, standard, and complete', () => {
      const values = TEMPLATE_CHOICES.map((c) => c.value);
      expect(values).toContain('minimal');
      expect(values).toContain('standard');
      expect(values).toContain('complete');
    });
  });

  describe('PLATFORM_CHOICES', () => {
    it('should have four platform options', () => {
      expect(PLATFORM_CHOICES).toHaveLength(4);
    });

    it('should include all platforms', () => {
      const values = PLATFORM_CHOICES.map((c) => c.value);
      expect(values).toContain('claude-code');
      expect(values).toContain('codex');
      expect(values).toContain('cursor');
      expect(values).toContain('all');
    });
  });

  describe('DEFAULTS', () => {
    it('should have standard as default template', () => {
      expect(DEFAULTS.template).toBe('standard');
    });

    it('should have all as default platform', () => {
      expect(DEFAULTS.platform).toBe('all');
    });

    it('should have 1.0.0 as default version', () => {
      expect(DEFAULTS.version).toBe('1.0.0');
    });

    it('should have interactive as true by default', () => {
      expect(DEFAULTS.interactive).toBe(true);
    });

    it('should have force as false by default', () => {
      expect(DEFAULTS.force).toBe(false);
    });
  });
});
