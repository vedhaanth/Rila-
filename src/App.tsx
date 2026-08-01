import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { api } from './services/api';
import { Product } from './types';

// Customer Components
import { CustomerNavbar } from './components/CustomerNavbar';
import { CustomerFooter } from './components/CustomerFooter';
import { HomePage } from './components/HomePage';
import { ProductsPage } from './components/ProductsPage';
import { AboutUsPage } from './components/AboutUsPage';
import { ContactUsPage } from './components/ContactUsPage';
import { FeedbackPage } from './components/FeedbackPage';
import { OrdersPage } from './components/OrdersPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickViewModal } from './components/QuickViewModal';

// Shared Modals & Overlays
import { InvoiceModal } from './components/InvoiceModal';
import { EmailLogModal } from './components/EmailLogModal';
import { LoginModal } from './components/LoginModal';
import { ToastContainer } from './components/ToastContainer';

// Admin ERP Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminInventory } from './components/admin/AdminInventory';
import { AdminBilling } from './components/admin/AdminBilling';
import { AdminExpenses } from './components/admin/AdminExpenses';
import { AdminReports } from './components/admin/AdminReports';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminSettings } from './components/admin/AdminSettings';

// Order Manager Component
import { OrderManager } from './components/OrderManager';

export function App() {
  const {
    currentPortal,
    activeCustomerTab,
    activeAdminTab,
    refreshDataFlag
  } = useApp();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchAllProducts = async () => {
    try {
      const prods = await api.getProducts();
      setAllProducts(prods);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, [refreshDataFlag]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Portal Routing */}
      {currentPortal === 'customer' ? (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <CustomerNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <main className="min-h-[70vh]">
              {activeCustomerTab === 'home' && (
                <HomePage products={allProducts} setSelectedCategory={setSelectedCategory} />
              )}

              {activeCustomerTab === 'products' && (
                <ProductsPage
                  products={allProducts}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}

              {activeCustomerTab === 'about' && <AboutUsPage />}

              {activeCustomerTab === 'contact' && <ContactUsPage />}

              {activeCustomerTab === 'feedback' && <FeedbackPage />}

              {activeCustomerTab === 'orders' && <OrdersPage />}
            </main>
          </div>

          <CustomerFooter />
        </div>
      ) : currentPortal === 'order_manager' ? (
        /* Order Manager Portal */
        <OrderManager />
      ) : (
        /* Admin ERP Portal */
        <AdminLayout>
          {activeAdminTab === 'dashboard' && <AdminDashboard />}
          {activeAdminTab === 'products' && <AdminProducts />}
          {activeAdminTab === 'orders' && <AdminOrders />}
          {activeAdminTab === 'inventory' && <AdminInventory />}
          {activeAdminTab === 'billing' && <AdminBilling />}
          {activeAdminTab === 'expenses' && <AdminExpenses />}
          {activeAdminTab === 'reports' && <AdminReports />}
          {activeAdminTab === 'customers' && <AdminCustomers />}
          {activeAdminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
      )}

      {/* Global Modals & Overlay Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <QuickViewModal />
      <InvoiceModal />
      <EmailLogModal />
      <LoginModal />
      <ToastContainer />
    </div>
  );
}

export default App;
