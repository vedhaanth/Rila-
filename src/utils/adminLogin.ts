export type AdminLoginTarget = 'admin1' | 'admin2' | 'order_manager' | null;

const ADMIN_CREDENTIALS: Record<string, AdminLoginTarget> = {
  'admin@smartretail.com': 'admin1',
  'admin1@smartretail.com': 'admin1',
  'admin2@smartretail.com': 'admin2',
  'employee@smartretail.com': 'order_manager',
  'order.manager@smartretail.com': 'order_manager'
};

export const resolveAdminLogin = (email: string, password: string): AdminLoginTarget => {
  if (password !== 'admin123') return null;
  return ADMIN_CREDENTIALS[email.trim().toLowerCase()] ?? null;
};
