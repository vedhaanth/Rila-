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

  // Use current origin in production if no explicit API URL is configured.
  if (origin) {
    return `${origin}/api`;
  }

  // Fallback to Vercel or other hosted URLs if origin isn't available.
  if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
    return 'https://rila.onrender.com/api';
  }

  return '/api';
}
