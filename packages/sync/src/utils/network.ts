import { request } from 'node:https';

const CHECK_URLS = ['https://www.google.com', 'https://cloudflare.com', 'https://www.baidu.com'];

const TIMEOUT_MS = 5000;

export async function checkNetworkConnectivity(): Promise<boolean> {
  const checks = CHECK_URLS.map((url) => checkUrl(url));
  const results = await Promise.allSettled(checks);
  return results.some((r) => r.status === 'fulfilled' && r.value);
}

function checkUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const req = request(
      {
        hostname: urlObj.hostname,
        port: 443,
        method: 'HEAD',
        timeout: TIMEOUT_MS,
      },
      (res) => {
        resolve(res.statusCode !== undefined && res.statusCode < 500);
      }
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

export function createNetworkMonitor(
  onOnline: () => void,
  onOffline: () => void,
  checkIntervalMs = 30000
): { start: () => void; stop: () => void } {
  let intervalId: NodeJS.Timeout | null = null;
  let wasOnline = true;

  const check = async () => {
    const isOnline = await checkNetworkConnectivity();
    if (isOnline && !wasOnline) {
      onOnline();
    } else if (!isOnline && wasOnline) {
      onOffline();
    }
    wasOnline = isOnline;
  };

  return {
    start: () => {
      if (intervalId) return;
      check();
      intervalId = setInterval(check, checkIntervalMs);
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
