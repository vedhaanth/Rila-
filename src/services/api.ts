import {
  Product,
  Order,
  Bill,
  Expense,
  Supplier,
  Feedback,
  EmailLog,
  AdminId,
  OrderStatus,
  ProfitLossReport,
  UserProfile
} from '../types';

const API_BASE = (() => {
  // Priority order:
  // 1. Vite compile-time env var `VITE_API_URL`
  // 2. Vite compile-time env var `VITE_API_BASE`
  // 3. Runtime global `window.__VITE_API_BASE` (settable from index.html)
  // 4. Same-origin `/api` on the current host
  try {
    const viteUrl = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || '';
    if (viteUrl) return viteUrl;
    const viteBase = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || '';
    if (viteBase) return viteBase;
  } catch (e) {
    // ignore
  }
  const runtime = (typeof window !== 'undefined' && (window as any).__VITE_API_BASE) || '';
  if (runtime) return runtime;
  if (typeof window !== 'undefined') return `${window.location.origin}/api`;
  return '/api';
})();

export const api = {
  // ADMINS
  async loginAdmin(email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to login admin' }));
      throw new Error(error.error || 'Failed to login admin');
    }
    return await res.json();
  },

  async getAdmins(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/admins`);
      if (!res.ok) throw new Error('Failed to fetch admins');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async updateAdmin(admin_id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/admins/${admin_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update admin');
    return await res.json();
  },

  // PRODUCTS
  async getProducts(params?: { admin_owner?: string; category?: string; search?: string }): Promise<Product[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/products?${query}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create product');
    return await res.json();
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return await res.json();
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async seedSampleProducts(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/products/seed-sample`, { method: 'POST' });
    return res.ok;
  },

  async clearAllProducts(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/products/clear-all`, { method: 'POST' });
    return res.ok;
  },

  // ORDERS
  async getOrders(params?: { admin_id?: string; customer_email?: string }): Promise<Order[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/orders?${query}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async createOrder(orderPayload: any): Promise<{ success: boolean; master_order_id: string; orders: Order[]; bills: Bill[] }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const message = errorBody?.error || 'Failed to place order';
      throw new Error(message);
    }
    return await res.json();
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return await res.json();
  },

  // BILLING
  async getBills(admin_id?: string): Promise<Bill[]> {
    try {
      const res = await fetch(`${API_BASE}/bills?admin_id=${admin_id || 'all'}`);
      if (!res.ok) throw new Error('Failed to fetch bills');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async createBill(billPayload: any): Promise<Bill> {
    const res = await fetch(`${API_BASE}/bills/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billPayload)
    });
    if (!res.ok) throw new Error('Failed to generate invoice');
    return await res.json();
  },

  async createManualBill(billPayload: any): Promise<Bill> {
    return this.createBill(billPayload);
  },

  // EXPENSES
  async getExpenses(params?: { admin_id?: string; category?: string }): Promise<Expense[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/expenses?${query}`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record expense');
    return await res.json();
  },

  async deleteExpense(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // SUPPLIERS
  async getSuppliers(admin_id?: string): Promise<Supplier[]> {
    try {
      const res = await fetch(`${API_BASE}/suppliers?admin_id=${admin_id || 'all'}`);
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add supplier');
    return await res.json();
  },

  async deleteSupplier(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // CUSTOMERS
  async getCustomers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/customers`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async loginCustomer(email: string, password?: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to login' }));
      throw new Error(error.error || 'Failed to login customer');
    }
    return await res.json();
  },

  async registerCustomer(data: { name: string; email: string; phone?: string; address?: string; password?: string }): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const text = await res.text();
      let errorMessage = 'Failed to register customer';
      try {
        const parsed = JSON.parse(text);
        errorMessage = parsed?.error || parsed?.message || errorMessage;
      } catch {
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  },

  // FEEDBACK & REVIEWS
  async getFeedback(productId?: string): Promise<Feedback[]> {
    try {
      const url = productId ? `${API_BASE}/feedback?product_id=${productId}` : `${API_BASE}/feedback`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch feedback');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async submitFeedback(data: Partial<Feedback>): Promise<Feedback> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return await res.json();
  },

  async upvoteHelpful(id: string): Promise<Feedback> {
    const res = await fetch(`${API_BASE}/feedback/${id}/helpful`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error('Failed to upvote review');
    return await res.json();
  },

  async replyFeedback(id: string, reply: string): Promise<Feedback> {
    const res = await fetch(`${API_BASE}/feedback/${id}/reply`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    });
    if (!res.ok) throw new Error('Failed to reply feedback');
    return await res.json();
  },

  // EMAIL LOGS
  async getEmailLogs(): Promise<EmailLog[]> {
    try {
      const res = await fetch(`${API_BASE}/email-logs`);
      if (!res.ok) throw new Error('Failed to fetch email logs');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // PROFIT & LOSS REPORT
  async getPnLReport(admin_id: AdminId): Promise<ProfitLossReport | null> {
    try {
      const res = await fetch(`${API_BASE}/reports/pnl?admin_id=${admin_id}`);
      if (!res.ok) throw new Error('Failed to fetch PnL report');
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }
};
