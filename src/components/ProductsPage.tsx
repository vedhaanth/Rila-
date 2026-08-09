import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/currency';
import {
  Search,
  Filter,
  ShoppingBag,
  Star,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  Info,
  Plus,
  Minus,
  X,
  Sparkles,
  Heart,
  Package,
  Boxes,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

export const ProductsPage: React.FC<{
  products: Product[];
  isLoading?: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}> = ({ products, isLoading = false, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery }) => {
  const {
    addToCart,
    setSelectedProductForView,
    setIsCartOpen,
    setIsCheckoutOpen,
    cart,
    updateCartQuantity,
    toggleWishlist,
    isInWishlist,
    setCurrentPortal,
    addToast,
    triggerRefresh
  } = useApp();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [priceRange, setPriceRange] = useState<number>(1500);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);



  const categories = [
    'All',
    'Healthy Snacks',
    'Dry Fruits & Nuts',
    'Organic Staples',
    'Sugar-Free Products',
    'Traditional Foods',
    'Ladoo Specialties',
    'Savouries & Namkeen',
    'Chaat & Hot Snacks',
    'Gift Hampers',
    'Festive Gifting Boxes',
    'Pickles & Condiments',
    'Beverages & Health Drinks'
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category Filter
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Price Filter
      if (p.price > priceRange) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.product_name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, priceRange, searchQuery, sortBy]);

  const getCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.product_id === productId);
    return item ? item.quantity : 0;
  };

  const handleBuyNow = (p: Product) => {
    addToCart(p, 1);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 bg-[#FAF7F2]/50">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif-display text-2xl font-bold text-stone-900 tracking-tight">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Browse our curated selection of healthy &amp; quality products
          </p>
        </div>
      </div>

      {/* Horizontal Category Pill Bar - Minimal Style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200/60 pt-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition shrink-0 border ${isActive
                ? 'bg-stone-900 text-white border-stone-900 font-bold'
                : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
                }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search, Filter & Sort Controls Bar */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4 dark:bg-slate-950 dark:border-slate-700">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 font-normal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Summary & Sort */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs">
          <span className="text-stone-500 font-normal">
            Showing <b className="text-stone-900 font-semibold">{filteredProducts.length}</b> products
          </span>

          <div className="flex items-center gap-2">


            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${priceRange < 1500
                ? 'bg-stone-900 text-white border-stone-900 font-bold'
                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                }`}
            >
              <SlidersHorizontal className="w-3 h-3" /> Price (₹{priceRange})
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 text-stone-800 font-medium focus:outline-none focus:border-stone-800"
            >
              <option value="featured">Featured / Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated ★</option>
            </select>
          </div>
        </div>
      </div>

      {/* Price Filter Drawer */}
      {showFilterDrawer && (
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between items-center text-xs font-medium text-stone-700 mb-1">
              <span>Max Price</span>
              <span className="font-mono font-bold text-stone-900">₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="5"
              max="1500"
              step="25"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-stone-800 cursor-pointer"
            />
          </div>

          <button
            onClick={() => setPriceRange(1500)}
            className="text-xs text-stone-700 hover:underline shrink-0 font-medium"
          >
            Reset
          </button>
        </div>
      )}

      {/* 4-Column Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <Package className="w-10 h-10 mx-auto text-stone-300 mb-3" />
          <h3 className="font-serif-display font-bold text-stone-900 text-lg">
            {products.length === 0 ? 'No Products In Catalog' : 'No Matching Products Found'}
          </h3>
          <p className="text-sm text-stone-500 mt-1.5 max-w-md mx-auto">
            {products.length === 0
              ? 'The product catalog is currently empty. Add inventory from the Admin ERP to start selling.'
              : 'Try resetting search filters or selecting another category.'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setPriceRange(1500);
              }}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-xl transition"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-stone-200 bg-stone-100 p-4 animate-pulse dark:border-slate-700 dark:bg-slate-900" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const qty = getCartQuantity(p.product_id);
            const saved = isInWishlist(p.product_id);

            return (
              <div
                key={p.product_id}
                className="product-card relative overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_70px_-30px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-950 card-animated"
              >
                {/* Discount Badge */}
                {p.discount > 0 && (
                  <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow">
                    {p.discount}% OFF
                  </span>
                )}

                {/* Wishlist Heart */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(p.product_id); }}
                  className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm border ${saved
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-white/90 text-stone-400 hover:text-rose-500 border-stone-200 dark:bg-slate-900 dark:border-slate-700'
                    }`}
                  title={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
                >
                  <Heart className={`w-4 h-4 transition ${saved ? 'fill-white' : ''}`} />
                </button>

                {/* Image */}
                <div
                  onClick={() => setSelectedProductForView(p)}
                  className="cursor-pointer bg-stone-50 flex items-center justify-center h-44 overflow-hidden border-b border-stone-100"
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.product_name}
                      className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-3.5 flex flex-col flex-1 gap-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="veg-badge" title="Pure Veg" />
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">{p.category}</span>
                    </div>
                    <h3
                      onClick={() => setSelectedProductForView(p)}
                      className="cursor-pointer font-bold text-sm text-stone-900 line-clamp-1 hover:text-amber-800 transition"
                    >
                      {p.product_name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="mt-auto">
                    {/* Rating + Stock */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-stone-700">{p.rating}</span>
                        <span>({p.reviews_count})</span>
                      </div>
                      <span className={`font-semibold ${p.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-2.5 pt-2 border-t border-stone-100">
                      <span className="text-base font-bold text-stone-900 font-mono">{formatINR(p.price ?? 0)}</span>
                      {(p.original_price ?? 0) > (p.price ?? 0) && (
                        <span className="text-xs text-stone-400 line-through font-mono">{formatINR(p.original_price ?? 0)}</span>
                      )}
                    </div>

                    {/* Action */}
                    {qty === 0 ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => addToCart(p, 1)}
                          disabled={p.stock === 0}
                          className="py-2 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-800 hover:from-stone-900 hover:via-stone-800 hover:to-stone-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1 shadow-[0_10px_24px_-12px_rgba(17,24,39,0.55)]"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                        <button
                          onClick={() => handleBuyNow(p)}
                          disabled={p.stock === 0}
                          className="py-2 bg-white hover:bg-amber-50 text-stone-800 disabled:opacity-50 font-semibold text-xs rounded-2xl transition border border-stone-200 hover:border-amber-300 shadow-[0_6px_16px_-10px_rgba(120,53,15,0.28)]"
                        >
                          Buy Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-stone-950 text-white rounded-xl px-1 py-1">
                          <button
                            onClick={() => updateCartQuantity(p.product_id, -1)}
                            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold text-sm">{qty}</span>
                          <button
                            onClick={() => updateCartQuantity(p.product_id, 1)}
                            className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleBuyNow(p)}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-2xl transition shadow-[0_10px_24px_-12px_rgba(245,158,11,0.65)]"
                        >
                          Buy Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
};

