import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, AdminId, Order, Bill, EmailLog, AdminProfile } from '../types';
import { api } from '../services/api';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation & View Mode
  currentPortal: 'customer' | 'admin' | 'order_manager';
  setCurrentPortal: (portal: 'customer' | 'admin' | 'order_manager') => void;
  activeCustomerTab: 'home' | 'products' | 'about' | 'contact' | 'feedback' | 'orders' | 'account';
  setActiveCustomerTab: (tab: 'home' | 'products' | 'about' | 'contact' | 'feedback' | 'orders' | 'account') => void;
  activeAdminTab: 'dashboard' | 'products' | 'orders' | 'inventory' | 'billing' | 'expenses' | 'reports' | 'customers' | 'employees' | 'settings';
  setActiveAdminTab: (tab: 'dashboard' | 'products' | 'orders' | 'inventory' | 'billing' | 'expenses' | 'reports' | 'customers' | 'employees' | 'settings') => void;

  // Active Admin Selection
  activeAdminId: AdminId;
  setActiveAdminId: (id: AdminId) => void;
  adminProfiles: Record<string, AdminProfile>;
  fetchAdmins: () => void;

  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginAsAdmin: (target?: AdminId) => void;
  loginAsOrderManager: (employee?: any) => void;
  loginAsCustomer: (customer: User) => void;
  logout: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartSubtotal: number;
  cartItemCount: number;

  // Modals
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  selectedProductForView: Product | null;
  setSelectedProductForView: (p: Product | null) => void;
  viewingInvoice: Bill | Order | null;
  setViewingInvoice: (bill: Bill | Order | null) => void;

  // Global Data Refresh Trigger
  refreshDataFlag: number;
  triggerRefresh: () => void;

  // Notifications
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Email Logs Modal
  isEmailLogModalOpen: boolean;
  setIsEmailLogModalOpen: (open: boolean) => void;
  emailLogs: EmailLog[];
  fetchEmailLogs: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPortal, setCurrentPortal] = useState<'customer' | 'admin' | 'order_manager'>('customer');
  const [activeCustomerTab, setActiveCustomerTab] = useState<'home' | 'products' | 'about' | 'contact' | 'feedback' | 'orders' | 'account'>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'products' | 'orders' | 'inventory' | 'billing' | 'expenses' | 'reports' | 'customers' | 'settings'>('dashboard');
  const [activeAdminId, setActiveAdminId] = useState<AdminId>('admin1');
  const [adminProfiles, setAdminProfiles] = useState<Record<string, AdminProfile>>(ADMIN_PROFILES);

  // Start with no logged in user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('rila_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    return [];
  });

  // Modals & UI Controls
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Bill | Order | null>(null);
  const [isEmailLogModalOpen, setIsEmailLogModalOpen] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // Refresh trigger
  const [refreshDataFlag, setRefreshDataFlag] = useState(0);
  const triggerRefresh = () => setRefreshDataFlag((prev) => prev + 1);

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('eat_rila_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('eat_rila_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('rila_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('rila_current_user');
      }
    } catch (e) {
      console.error('Failed to persist current user', e);
    }
  }, [currentUser]);

  const toggleWishlist = (productId: string) => {
    if (!currentUser) {
      addToast('Please Sign In', 'You need to be logged in to save items to your wishlist.', 'info');
      setIsLoginModalOpen(true);
      return;
    }

    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Removed from Wishlist', 'Item has been removed from your saved items.');
        return prev.filter((id) => id !== productId);
      } else {
        addToast('Added to Wishlist', 'Item saved to your wishlist! View it in Orders.');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Helper Quick Logins
  const loginAsAdmin = (target: AdminId = 'admin1') => {
    const adminProfile = adminProfiles[target] || ADMIN_PROFILES[target];
    const adminLabel = target === 'admin2' ? 'Division B' : 'Division A';

    setCurrentUser({
      user_id: target === 'admin2' ? 'ADM-002' : 'ADM-001',
      name: adminProfile?.admin_name || (target === 'admin2' ? 'Vogue Living Admin' : 'Apex Tech Admin'),
      email: target === 'admin2' ? 'admin2@smartretail.com' : 'admin1@smartretail.com',
      role: 'admin',
      admin_id: target
    });
    setActiveAdminId(target);
    setCurrentPortal('admin');
    setActiveAdminTab('dashboard');
    addToast(`${adminLabel} Access Granted`, `Switched to ${adminProfile?.business_name || 'Admin Portal'}`);
    setIsLoginModalOpen(false);
  };

  const loginAsOrderManager = (employee?: any) => {
    setCurrentUser({
      user_id: employee?.employee_id || 'EMP-001',
      name: employee?.name || 'Order Management Staff',
      email: employee?.email || 'employee@smartretail.com',
      role: 'order_manager',
      admin_id: employee?.admin_id
    });
    if (employee?.admin_id) {
      setActiveAdminId(employee.admin_id);
    }
    setCurrentPortal('order_manager');
    addToast('Order Manager Access', `Signed in as ${employee?.name || 'Order Management Staff'}.`);
    setIsLoginModalOpen(false);
  };

  const loginAsCustomer = (customer: User) => {
    setCurrentUser({
      ...customer,
      role: 'customer'
    });
    setCurrentPortal('customer');
    setActiveCustomerTab('home');
    addToast('Welcome Back', `Signed in as ${customer.name}`);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPortal('customer');
    addToast('Logged Out', 'You have been safely signed out.');
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    if (!currentUser) {
      addToast('Please Sign In', 'You need to be logged in to add items to the cart.', 'info');
      setIsLoginModalOpen(true);
      return;
    }

    if (currentUser.role !== 'customer') {
      addToast('Customers Only', 'Only customer accounts can add items to the cart. Please log in with a customer account.', 'info');
      setIsLoginModalOpen(true);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.product_id === product.product_id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    addToast('Added to Cart', `${product.product_name} added to your shopping bag.`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.product_id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.product?.price) || 0) * (Number(item.quantity) || 0), 0);
  const cartSubtotal = cartTotal;
  const cartItemCount = cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  const fetchEmailLogs = async () => {
    const logs = await api.getEmailLogs();
    setEmailLogs(logs);
  };

  const fetchAdmins = async () => {
    try {
      const admins = await api.getAdmins();
      if (admins && admins.length > 0) {
        const adminMap: Record<string, AdminProfile> = {};
        admins.forEach((a: any) => {
          adminMap[a.admin_id] = a;
        });
        setAdminProfiles(adminMap);
      }
    } catch (e) {
      console.error('Error fetching admins:', e);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
    fetchAdmins();
  }, [refreshDataFlag]);

  return (
    <AppContext.Provider
      value={{
        currentPortal,
        setCurrentPortal,
        activeCustomerTab,
        setActiveCustomerTab,
        activeAdminTab,
        setActiveAdminTab,
        activeAdminId,
        setActiveAdminId,
        adminProfiles,
        fetchAdmins,
        currentUser,
        setCurrentUser,
        loginAsAdmin,
        loginAsOrderManager,
        loginAsCustomer,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartSubtotal,
        cartItemCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        selectedProductForView,
        setSelectedProductForView,
        viewingInvoice,
        setViewingInvoice,
        refreshDataFlag,
        triggerRefresh,
        toasts,
        addToast,
        removeToast,
        isEmailLogModalOpen,
        setIsEmailLogModalOpen,
        emailLogs,
        fetchEmailLogs,
        wishlist,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
