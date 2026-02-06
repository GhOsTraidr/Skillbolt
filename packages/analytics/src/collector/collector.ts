import type {
  AnalyticsEvent,
  AnalyticsEventInput,
  EventQueryOptions,
  ClearOptions,
  AnalyticsOptions,
  ResolvedAnalyticsConfig,
} from '../types/index.js';
import { DEFAULT_ANALYTICS_CONFIG } from '../types/index.js';
import { AnalyticsStorage } from '../storage/index.js';
import { applyPrivacyFilter, isCollectionEnabled } from './privacy.js';

function resolveConfig(options: AnalyticsOptions = {}): ResolvedAnalyticsConfig {
  return {
    enabled: options.enabled ?? DEFAULT_ANALYTICS_CONFIG.enabled,
    privacyLevel: options.privacyLevel ?? DEFAULT_ANALYTICS_CONFIG.privacyLevel,
    dbPath: options.dbPath ?? DEFAULT_ANALYTICS_CONFIG.dbPath,
    retentionDays: options.retentionDays ?? DEFAULT_ANALYTICS_CONFIG.retentionDays,
    autoCleanup: options.autoCleanup ?? DEFAULT_ANALYTICS_CONFIG.autoCleanup,
  };
}

export class AnalyticsCollector {
  private storage: AnalyticsStorage | null = null;
  private config: ResolvedAnalyticsConfig;

  constructor(options: AnalyticsOptions = {}) {
    this.config = resolveConfig(options);
  }

  private getStorage(): AnalyticsStorage {
    if (!this.storage) {
      this.storage = new AnalyticsStorage(this.config);
    }
    return this.storage;
  }

  isEnabled(): boolean {
    return this.config.enabled && isCollectionEnabled(this.config.privacyLevel);
  }

  track(input: AnalyticsEventInput): AnalyticsEvent | null {
    if (!this.isEnabled()) {
      return null;
    }

    const filtered = applyPrivacyFilter(input, this.config.privacyLevel);
    return this.getStorage().insert(filtered);
  }

  query(options: EventQueryOptions = {}): AnalyticsEvent[] {
    if (!this.isEnabled()) {
      return [];
    }

    return this.getStorage().query(options);
  }

  count(options: Omit<EventQueryOptions, 'limit' | 'offset' | 'orderBy' | 'order'> = {}): number {
    if (!this.isEnabled()) {
      return 0;
    }

    return this.getStorage().count(options);
  }

  getUniqueSkills(): string[] {
    if (!this.isEnabled()) {
      return [];
    }

    return this.getStorage().getUniqueSkills();
  }

  getDateRange(): { startDate: string; endDate: string } | null {
    if (!this.isEnabled()) {
      return null;
    }

    return this.getStorage().getDateRange();
  }

  clear(options: ClearOptions = {}): number {
    if (!this.storage) {
      return 0;
    }

    return this.storage.clear(options);
  }

  cleanup(): number {
    if (!this.storage) {
      return 0;
    }

    return this.storage.cleanup();
  }

  getConfig(): ResolvedAnalyticsConfig {
    return { ...this.config };
  }

  getStorageStats(): {
    totalEvents: number;
    dbSizeBytes: number;
    oldestEvent: string | null;
    newestEvent: string | null;
  } | null {
    if (!this.storage) {
      return null;
    }

    return this.storage.getStats();
  }

  close(): void {
    if (this.storage) {
      this.storage.close();
      this.storage = null;
    }
  }
}

export function createCollector(options: AnalyticsOptions = {}): AnalyticsCollector {
  return new AnalyticsCollector(options);
}

let defaultCollector: AnalyticsCollector | null = null;

export function getDefaultCollector(): AnalyticsCollector {
  if (!defaultCollector) {
    defaultCollector = new AnalyticsCollector();
  }
  return defaultCollector;
}

export function trackEvent(input: AnalyticsEventInput): AnalyticsEvent | null {
  return getDefaultCollector().track(input);
}
