import { describe, it, expect } from 'vitest';
import { getPackageName, getAllCommands, getUniquePackages } from '../src/utils/loader.js';

describe('loader', () => {
  describe('getPackageName', () => {
    it('returns correct package for lint', () => {
      expect(getPackageName('lint')).toBe('@skillbolt/lint');
    });

    it('returns correct package for init', () => {
      expect(getPackageName('init')).toBe('@skillbolt/init');
    });

    it('returns registry package for install', () => {
      expect(getPackageName('install')).toBe('@skillbolt/registry');
    });

    it('returns registry package for list', () => {
      expect(getPackageName('list')).toBe('@skillbolt/registry');
    });

    it('returns registry package for update', () => {
      expect(getPackageName('update')).toBe('@skillbolt/registry');
    });

    it('returns registry package for remove', () => {
      expect(getPackageName('remove')).toBe('@skillbolt/registry');
    });

    it('returns undefined for unknown command', () => {
      expect(getPackageName('unknown')).toBeUndefined();
    });
  });

  describe('getAllCommands', () => {
    it('returns all command names', () => {
      const commands = getAllCommands();
      expect(commands).toContain('lint');
      expect(commands).toContain('init');
      expect(commands).toContain('install');
      expect(commands).toContain('list');
      expect(commands).toContain('update');
      expect(commands).toContain('remove');
      expect(commands).toContain('distill');
      expect(commands).toContain('convert');
      expect(commands).toContain('test');
      expect(commands).toContain('sync');
      expect(commands).toContain('analytics');
      expect(commands).toContain('compose');
      expect(commands).toContain('doc');
    });
  });

  describe('getUniquePackages', () => {
    it('returns unique package names', () => {
      const packages = getUniquePackages();
      expect(packages).toContain('@skillbolt/lint');
      expect(packages).toContain('@skillbolt/init');
      expect(packages).toContain('@skillbolt/registry');
      expect(packages.filter((p) => p === '@skillbolt/registry').length).toBe(1);
    });
  });
});
