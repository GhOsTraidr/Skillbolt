export { installFromLocal } from './local.js';
export type { LocalInstallOptions } from './local.js';

export { installFromGitHub } from './github.js';
export type { GitHubInstallOptions } from './github.js';

export { installFromRegistry } from './remote.js';
export type { RemoteInstallOptions } from './remote.js';

export {
  resolveInstallTarget,
  getSourceDisplayName,
  isGitHubSource,
  isLocalSource,
  isRegistrySource,
} from './resolver.js';
export type { ResolvedTarget } from './resolver.js';

export { validateSkillDirectory, getSkillName, getSkillManifest } from './validator.js';
export type { ValidationResult } from './validator.js';
