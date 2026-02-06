import semver from 'semver';

export function isValidVersion(version: string): boolean {
  return semver.valid(version) !== null;
}

export function isValidRange(range: string): boolean {
  return semver.validRange(range) !== null;
}

export function satisfies(version: string, range: string): boolean {
  return semver.satisfies(version, range);
}

export function getMaxSatisfying(versions: string[], range: string): string | null {
  return semver.maxSatisfying(versions, range);
}

export function compareVersions(a: string, b: string): number {
  return semver.compare(a, b);
}

export function isGreaterThan(a: string, b: string): boolean {
  return semver.gt(a, b);
}

export function isLessThan(a: string, b: string): boolean {
  return semver.lt(a, b);
}

export function getUpdateType(from: string, to: string): 'major' | 'minor' | 'patch' | null {
  if (!isValidVersion(from) || !isValidVersion(to)) {
    return null;
  }

  const diff = semver.diff(from, to);
  if (diff === 'major' || diff === 'premajor') {
    return 'major';
  }
  if (diff === 'minor' || diff === 'preminor') {
    return 'minor';
  }
  if (diff === 'patch' || diff === 'prepatch' || diff === 'prerelease') {
    return 'patch';
  }

  return null;
}

export function coerceVersion(version: string): string | null {
  const coerced = semver.coerce(version);
  return coerced ? coerced.version : null;
}

export function parseVersion(
  version: string
): { major: number; minor: number; patch: number } | null {
  const parsed = semver.parse(version);
  if (!parsed) {
    return null;
  }
  return {
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
  };
}

export function normalizeVersion(version: string | undefined): string {
  if (!version) {
    return '0.0.0';
  }
  const coerced = coerceVersion(version);
  return coerced ?? '0.0.0';
}
