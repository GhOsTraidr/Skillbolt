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
} from './version.js';

export { downloadFile, calculateFileSha256, getTempDownloadPath } from './download.js';
export type { DownloadOptions, DownloadResult } from './download.js';

export {
  extractTarball,
  createTarball,
  listTarballContents,
  getTempExtractPath,
} from './archive.js';
export type { ExtractOptions } from './archive.js';
