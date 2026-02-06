import type {
  ApiClientConfig,
  SearchRequest,
  SearchResponse,
  SkillDetails,
  ApiError,
} from '../types/api.js';

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 3;

export class SkillHubClient {
  private readonly baseUrl: string;
  private readonly token?: string;
  private readonly timeout: number;
  private readonly retries: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.token = config.auth?.token ?? config.auth?.apiKey;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.retries = config.retries ?? DEFAULT_RETRIES;
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    const params = new URLSearchParams();
    params.set('q', request.query);
    if (request.limit) params.set('limit', String(request.limit));
    if (request.offset) params.set('offset', String(request.offset));
    if (request.tags?.length) params.set('tags', request.tags.join(','));
    if (request.platform) params.set('platform', request.platform);

    const response = await this.request<SearchResponse>(`/v1/skills/search?${params.toString()}`);
    return response;
  }

  async getSkillDetails(name: string): Promise<SkillDetails | null> {
    try {
      const encodedName = encodeURIComponent(name);
      const response = await this.request<SkillDetails>(`/v1/skills/${encodedName}`);
      return response;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getVersions(name: string): Promise<string[]> {
    const details = await this.getSkillDetails(name);
    if (!details) {
      return [];
    }
    return details.versions.map((v) => v.version);
  }

  async getLatestVersion(name: string): Promise<string | null> {
    const details = await this.getSkillDetails(name);
    return details?.latestVersion ?? null;
  }

  async getTarballUrl(name: string, version: string): Promise<string | null> {
    const details = await this.getSkillDetails(name);
    if (!details) {
      return null;
    }
    const versionInfo = details.versions.find((v) => v.version === version);
    return versionInfo?.tarballUrl ?? null;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'skill-kit-registry/1.0.0',
        };

        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
          ...options,
          headers: { ...headers, ...options.headers },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await this.parseErrorBody(response);
          throw new ApiClientError(
            errorBody?.message ?? `HTTP ${response.status}`,
            response.status,
            errorBody
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof ApiClientError && error.status < 500) {
          throw error;
        }

        if (attempt < this.retries - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError ?? new Error('Request failed');
  }

  private async parseErrorBody(response: Response): Promise<ApiError | null> {
    try {
      const body = await response.json();
      return body as ApiError;
    } catch {
      return null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly apiError?: ApiError;

  constructor(message: string, status: number, apiError?: ApiError | null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.apiError = apiError ?? undefined;
  }
}
