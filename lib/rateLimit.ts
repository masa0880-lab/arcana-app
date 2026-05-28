// 単一インスタンス前提のシンプルな IP ベースレート制限。
// Vercelのサーバーレスではコールドスタートでリセットされるため完全ではないが、
// 悪意のない連打抑止には十分。本格運用は Upstash Redis 等を推奨。

const WINDOW_MS = 60_000;
const LIMIT = 5;

const buckets = new Map<string, Map<string, number[]>>();

export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

/**
 * scope ごとに別カウンタを使う。例: 'tarot' / 'numerology' / 'zodiac' / 'animal'
 * 各 scope で 5req/min まで許可。
 */
export function isRateLimited(scope: string, ip: string): boolean {
  let scopeMap = buckets.get(scope);
  if (!scopeMap) {
    scopeMap = new Map<string, number[]>();
    buckets.set(scope, scopeMap);
  }
  const now = Date.now();
  const bucket = (scopeMap.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (bucket.length >= LIMIT) {
    scopeMap.set(ip, bucket);
    return true;
  }
  bucket.push(now);
  scopeMap.set(ip, bucket);
  return false;
}
