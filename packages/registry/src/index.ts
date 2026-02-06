export type {
  InstallSource,
  InstallMode,
  InstalledSkill,
  InstalledRegistry,
  InstallOptions,
  InstallResult,
  ListOptions,
  UpdateOptions,
  UpdateResult,
  UninstallOptions,
  UninstallResult,
  OutdatedSkill,
  RegistryOptions,
  ApiAuthConfig,
  SearchRequest,
  SearchResultItem,
  SearchResponse,
  VersionInfo,
  SkillDetails,
  ApiError,
  ApiClientConfig,
} from './types/index.js';

export {
  installSkill,
  listSkills,
  formatSkillList,
  updateSkill,
  checkOutdated,
  uninstallSkill,
} from './commands/index.js';
export type { ListResult } from './commands/index.js';

export {
  LocalStorage,
  getDefaultStorageRoot,
  getDefaultCachePath,
  getMetadataPath,
  MetadataManager,
  FileLock,
  withLock,
} from './storage/index.js';

export { SkillHubClient, ApiClientError } from './api/index.js';

export {
  installFromLocal,
  installFromGitHub,
  installFromRegistry,
  resolveInstallTarget,
  getSourceDisplayName,
  isGitHubSource,
  isLocalSource,
  isRegistrySource,
  validateSkillDirectory,
  getSkillName,
  getSkillManifest,
} from './installer/index.js';
export type {
  LocalInstallOptions,
  GitHubInstallOptions,
  RemoteInstallOptions,
  ResolvedTarget,
  ValidationResult,
} from './installer/index.js';

export {
  isValidVersion,
  isValidRange,
  satisfies,
  getMaxSatisfying,
  compareVersions,
  isGreaterThan,
  isLessThan,
  getUpdateType,
  coerceVersion,
  parseVersion,
  normalizeVersion,
  downloadFile,
  calculateFileSha256,
  getTempDownloadPath,
  extractTarball,
  createTarball,
  listTarballContents,
  getTempExtractPath,
} from './utils/index.js';
export type { DownloadOptions, DownloadResult, ExtractOptions } from './utils/index.js';

export * from './groups/index.js';
