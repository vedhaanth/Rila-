import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import indianSweetsHero from '../../assets/images/indian_sweets_hero_1784805788619.jpg';
import { api } from '../../services/api';
import { Product } from '../../types';
import { formatINR } from '../../utils/currency';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { activeAdminId, refreshDataFlag, triggerRefresh, addToast } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    product_name: '',
    category: 'Laptops',
    description: '',
    price: 100,
    original_price: 120,
    discount: 15,
    stock: 50,
    min_stock_alert: 10,
    image: '',
    featured: false
  });

  const fetchProducts = async () => {
    setLoading(true);
    const list = await api.getProducts({ admin_owner: activeAdminId });
    setProducts(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [activeAdminId, refreshDataFlag]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      category: activeAdminId === 'admin1' ? 'Healthy Snacks' : 'Savouries & Namkeen',
      description: '',
      price: 250,
      original_price: 300,
      discount: 10,
      stock: 50,
      min_stock_alert: 10,
      image: '',
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear ALL products from the store catalog?')) {
      await api.clearAllProducts();
      addToast('Catalog Cleared', 'All products have been removed from the catalog.');
      triggerRefresh();
    }
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      product_name: p.product_name,
      category: p.category,
      description: p.description,
      price: p.price,
      original_price: p.original_price,
      discount: p.discount,
      stock: p.stock,
      min_stock_alert: p.min_stock_alert,
      image: p.image,
      featured: p.featured
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.product_id, {
          ...formData,
          admin_owner: activeAdminId
        });
        addToast('Product Updated', `Successfully updated ${formData.product_name}`);
      } else {
        await api.createProduct({
          ...formData,
          admin_owner: activeAdminId
        });
        addToast('Product Created', `Successfully added ${formData.product_name}`);
      }
      setIsModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await api.deleteProduct(id);
      addToast('Product Deleted', `${name} has been removed.`);
      triggerRefresh();
    }
  };

  const handleQuickStockAdjust = async (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    await api.updateProduct(p.product_id, { stock: newStock });
    triggerRefresh();
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.product_name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your store inventory, prices, discounts, and visual media ({products.length} products total)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {products.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-medium text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Products
            </button>
          )}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No products found in store catalog</p>
                    <p className="text-xs text-slate-400 mt-1">Start by adding a new product using the Admin ERP and publish the catalog once ready.</p>
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        onClick={handleOpenAddModal}
                        className="px-3.5 py-1.5 bg-stone-900 text-white font-semibold text-xs rounded-lg hover:bg-stone-800 transition"
                      >
                        + Add New Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.product_name}
                          className="w-12 h-12 rounded-xl object-contain bg-slate-50 border p-1"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">{p.product_name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {p.product_id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatINR(p.price ?? 0)}
                      {(p.original_price ?? 0) > (p.price ?? 0) && (
                        <span className="text-slate-400 text-[11px] line-through block font-mono">
                          {formatINR(p.original_price ?? 0)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {p.discount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                          {p.discount}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Regular</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold px-2.5 py-0.5 rounded text-[11px] ${p.stock < p.min_stock_alert ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                        >
                          {p.stock} units
                        </span>

                        <div className="flex gap-1 border rounded-lg overflow-hidden text-[11px]">
                          <button
                            onClick={() => handleQuickStockAdjust(p, -5)}
                            className="px-1.5 py-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Decrease by 5"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleQuickStockAdjust(p, 5)}
                            className="px-1.5 py-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Increase by 5"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.product_id, p.product_name)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 my-8 animate-scale-up relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g. UltraBook Laptop Pro"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex justify-between items-center">
                  <span>Product Photo / Image *</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Upload a file or enter an image URL</span>
                </label>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <label htmlFor="product-image-file" className="group block cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 hover:border-slate-400 transition">
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 shrink-0 mx-auto">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {formData.image ? 'Change product photo' : 'Click the card to choose an image'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Use the card above or the button below to upload.
                      </div>
                    </div>
                  </label>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-semibold transition hover:bg-slate-800"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Product Image
                    </button>
                  </div>

                  <input
                    id="product-image-file"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          addToast('File Too Large', 'Please select an image smaller than 5MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setFormData({ ...formData, image: ev.target.result as string });
                            addToast('Photo Loaded', `Attached ${file.name}`);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  <div className="grid gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Or use a web image URL instead:</span>
                    <input
                      type="text"
                      placeholder="Enter product image URL"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-2 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featured" className="font-semibold text-slate-700 dark:text-slate-300">
                  Highlight on Home Page Featured Banner
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div >
      )}
    </div >
  );
};
