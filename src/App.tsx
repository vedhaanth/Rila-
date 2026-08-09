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
import { LoginPage } from './components/LoginPage';

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
import { AdminEmployees } from './components/admin/AdminEmployees';
import { AdminSettings } from './components/admin/AdminSettings';

// Order Manager Component
import { OrderManager } from './components/OrderManager';

export function App() {
  const {
    currentPortal,
    activeCustomerTab,
    activeAdminTab,
    refreshDataFlag,
    theme
  } = useApp();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchAllProducts = async () => {
    setIsProductsLoading(true);
    try {
      const prods = await api.getProducts();
      setAllProducts(prods);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, [refreshDataFlag]);

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-amber-600 selection:text-white ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.12),_transparent_30%),linear-gradient(180deg,_#fcfaf7_0%,_#f7efe4_100%)] text-slate-900'}`}>
      {/* Portal Routing */}
      {currentPortal === 'customer' ? (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <CustomerNavbar products={allProducts} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSelectedCategory={setSelectedCategory} />

            <main className="min-h-[70vh]">
              {activeCustomerTab === 'home' && (
                <HomePage products={allProducts} setSelectedCategory={setSelectedCategory} />
              )}

              {activeCustomerTab === 'products' && (
                <ProductsPage
                  products={allProducts}
                  isLoading={isProductsLoading}
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

              {activeCustomerTab === 'account' && <OrdersPage />}

              {activeCustomerTab === 'login' && <LoginPage />}
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
          {activeAdminTab === 'employees' && <AdminEmployees />}
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
