export type Role = 'customer' | 'admin' | 'order_manager';
export type AdminId = string;

export interface AdminProfile {
  admin_id: AdminId;
  admin_name: string;
  email: string;
  business_name: string;
  phone: string;
  gstin: string;
  address: string;
  logo?: string;
  categories: string[];
}

export interface Employee {
  employee_id: string;
  admin_id: AdminId;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt?: string;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: Role;
  admin_id?: AdminId;
  phone?: string;
  address?: string;
  saved_addresses?: string[];
}

export type UserProfile = User;

export interface Product {
  product_id: string;
  product_name: string;
  category: string;
  image?: string;
  unit?: string;
  price: number;
  original_price: number;
  discount: number; // percentage
  stock: number;
  min_stock_alert?: number;
  admin_owner: AdminId;
  description: string;
  rating: number;
  reviews_count: number;
  specifications?: Record<string, string>;
  featured?: boolean;
  tags?: string[];
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  admin_owner: AdminId;
  image: string;
}

export interface Order {
  order_id: string;
  master_order_id: string; // Grouping ID if multi-admin order
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  // legacy alias used in some places
  delivery_address?: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  gst_amount: number;
  discount_amount: number;
  total_amount: number;
  admin_id: AdminId; // The admin who processes this sub-order
  status: OrderStatus;
  payment_method: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash on Delivery' | 'Cash';
  // legacy alias
  payment_mode?: string;
  payment_status: 'Paid' | 'Pending';
  created_at: string;
  tracking_number: string;
  timeline: OrderTimelineItem[];
}

export interface BillProductItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  discount?: number;
  gst_rate?: number;
  total: number;
}

export interface Bill {
  bill_id: string;
  invoice_number: string;
  bill_type?: 'Online' | 'Manual';
  master_order_id?: string;
  order_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_gstin?: string;
  shipping_address?: string;
  products?: BillProductItem[];
  items?: BillProductItem[];
  subtotal: number;
  tax_gst?: number;
  cgst?: number;
  sgst?: number;
  discount?: number;
  discount_total?: number;
  grand_total: number;
  current_total?: number;
  payment_method?: string;
  payment_mode?: string;
  payment_status: 'Paid' | 'Partially Paid' | 'Pending';
  amount_paid?: number;
  previous_balance_due?: number;
  balance_due?: number;
  sale_type?: 'Retail' | 'Wholesale';
  status?: string;
  admin_id: AdminId;
  created_at: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'Product Purchase'
  | 'Employee Salary'
  | 'Logistics'
  | 'Rent'
  | 'Electricity/Utilities'
  | 'Marketing'
  | 'Equipment'
  | 'Maintenance'
  | 'Other';

export interface FinanceMetrics {
  grossRevenue: number;
  totalSales: number;
  totalPurchaseCost: number;
  totalExpenses: number;
  taxCollected: number;
  discountGiven: number;
  shippingCharges: number;
  refundAmount: number;
  netRevenue: number;
  grossProfit: number;
  netProfit: number;
  loss: number;
}

export interface Expense {
  expense_id: string;
  admin_id: AdminId;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receipt_ref?: string;
  vendor?: string;
  invoice_number?: string;
  purchase_order_number?: string;
  gst?: number;
  discount?: number;
  payment_method?: string;
  payment_status?: 'Paid' | 'Pending' | 'Partially Paid';
  notes?: string;
}

export interface Supplier {
  supplier_id: string;
  admin_id: AdminId;
  supplier_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  company_name?: string;
  // alternate / legacy fields used across components
  company?: string;
  name?: string;
  gst_number?: string;
  products_supplied?: string[];
  outstanding_balance?: number;
  purchase_history?: string;
  categories_supplied?: string[];
}

export interface Feedback {
  feedback_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  type: 'Review' | 'Suggestion' | 'Complaint';
  message: string;
  status: 'Pending' | 'Resolved' | 'Published';
  created_at: string;
  admin_reply?: string;
  product_id?: string;
  product_name?: string;
  title?: string;
  verified_purchase?: boolean;
  helpful_count?: number;
}

export interface EmailLog {
  log_id: string;
  recipient: string;
  subject: string;
  body: string;
  type: 'Order Confirmation' | 'Invoice' | 'Shipping Update' | 'Admin Order Alert' | 'Delivery Confirmation';
  sent_at: string;
  status: 'Sent' | 'Failed';
}

export interface ProfitLossReport {
  admin_id: AdminId;
  period: string;
  sales_revenue: number;
  expenses: number;
  net_profit: number;
  total_orders: number;
  daily_sales: Array<{ date: string; sales: number; expenses: number; profit: number }>;
  category_sales: Array<{ category: string; amount: number }>;
  expense_breakdown: Array<{ category: ExpenseCategory; amount: number }>;
  finance_metrics?: FinanceMetrics;
}
