import type { InstallSource } from '../types/registry.js';

const GITHUB_PATTERN = /^github:([^\/]+\/[^@#]+)(?:@([^#]+))?(?:#(.+))?$/;
const SCOPED_PATTERN = /^(@[^\/]+\/[^@]+)(?:@(.+))?$/;
const UNSCOPED_PATTERN = /^([^@\/]+)(?:@(.+))?$/;

export interface ResolvedTarget {
  source: InstallSource;
  version?: string;
}

export function resolveInstallTarget(target: string): ResolvedTarget {
  const trimmed = target.trim();

  if (isLocalPath(trimmed)) {
    return {
      source: { type: 'local', path: trimmed },
    };
  }

  const githubMatch = trimmed.match(GITHUB_PATTERN);
  if (githubMatch) {
    const [, repo, ref] = githubMatch;
    return {
      source: { type: 'github', repo: repo!, ref },
      version: ref,
    };
  }

  if (trimmed.startsWith('https://github.com/') || trimmed.startsWith('git@github.com:')) {
    const parsed = parseGitHubUrl(trimmed);
    if (parsed) {
      return {
        source: { type: 'github', repo: parsed.repo, ref: parsed.ref, subdirectory: parsed.subdirectory },
        version: parsed.ref,
      };
    }
  }

  const scopedMatch = trimmed.match(SCOPED_PATTERN);
  if (scopedMatch) {
    const [, name, version] = scopedMatch;
    return {
      source: { type: 'registry', name: name! },
      version,
    };
  }

  const unscopedMatch = trimmed.match(UNSCOPED_PATTERN);
  if (unscopedMatch) {
    const [, name, version] = unscopedMatch;
    return {
      source: { type: 'registry', name: name! },
      version,
    };
  }

  throw new Error(`Invalid install target: ${target}`);
}

function isLocalPath(target: string): boolean {
  return (
    target.startsWith('./') ||
    target.startsWith('../') ||
    target.startsWith('/') ||
    target.startsWith('~/')
  );
}

function parseGitHubUrl(url: string): { repo: string; ref?: string; subdirectory?: string } | null {
  try {
    let repo: string;
    let ref: string | undefined;
    let subdirectory: string | undefined;

    if (url.startsWith('git@github.com:')) {
      const path = url.replace('git@github.com:', '').replace(/\.git$/, '');
      const parts = path.split('#');
      repo = parts[0]!;
      ref = parts[1];
    } else {
      const parsed = new URL(url);
      const pathname = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '');
      const parts = pathname.split('/tree/');

      if (parts.length === 2) {
        repo = parts[0]!;
        // parts[1] 可能包含 "ref/path/to/subdirectory"
        const pathParts = parts[1]!.split('/');
        ref = pathParts[0];
        // 如果有额外的路径部分，那就是子目录
        if (pathParts.length > 1) {
          subdirectory = pathParts.slice(1).join('/');
        }
      } else {
        repo = pathname;
        const hashParts = parsed.hash.replace('#', '').split('/');
        if (hashParts[0]) {
          ref = hashParts[0];
        }
      }
    }

    if (!repo || !repo.includes('/')) {
      return null;
    }

    return { repo, ref, subdirectory };
  } catch {
    return null;
  }
}

export function getSourceDisplayName(source: InstallSource): string {
  switch (source.type) {
    case 'local':
      return `local:${source.path}`;
    case 'github':
      return source.ref ? `github:${source.repo}@${source.ref}` : `github:${source.repo}`;
    case 'registry':
      return source.name;
  }
}

export function isGitHubSource(
  source: InstallSource
): source is { type: 'github'; repo: string; ref?: string } {
  return source.type === 'github';
}

export function isLocalSource(source: InstallSource): source is { type: 'local'; path: string } {
  return source.type === 'local';
}

export function isRegistrySource(
  source: InstallSource
): source is { type: 'registry'; name: string } {
  return source.type === 'registry';
}
