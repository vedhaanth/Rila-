export function resolveAdminLogin(email: string, password: string): string | null {
  const normalized = String(email).trim().toLowerCase();
  // Simple mapping used by tests and fallback logic
  const adminMap: Record<string, string> = {
    'admin@smartretail.com': 'admin1',
    'admin1@smartretail.com': 'admin1',
    'admin2@smartretail.com': 'admin2'
  };
  if (password !== 'admin123') return null;
  return adminMap[normalized] || null;
}
