export interface ApiBaseContext {
  hostname?: string;
  origin?: string;
}

export function resolveApiBase(
  context: ApiBaseContext,
  viteApiUrl = '',
  viteApiBase = '',
  runtimeBase = ''
): string {
  if (viteApiUrl) return viteApiUrl;
  if (viteApiBase) return viteApiBase;
  if (runtimeBase) return runtimeBase;

  const hostname = context.hostname || '';
  const origin = context.origin || '';

  if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
    return 'https://rila.onrender.com/api';
  }

  return origin ? `${origin}/api` : '/api';
}
