import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatINR } from '../utils/currency';
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
  Plus,
  Minus,
  Package
} from 'lucide-react';

export const HomePage: React.FC<{
  products: Product[];
  setSelectedCategory: (cat: string) => void;
}> = ({ products, setSelectedCategory }) => {
  const { setActiveCustomerTab, addToCart, setSelectedProductForView, cart, updateCartQuantity, setCurrentPortal, setIsCheckoutOpen, currentUser } = useApp();

  const featuredProducts = products.filter((p) => (p.featured || p.rating >= 4.8) && p.image).slice(0, 8);
  const heroCandidates = featuredProducts.length ? featuredProducts : products.filter((p) => p.image);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    setHeroIndex(0);
  }, [heroCandidates.length]);

  useEffect(() => {
    if (heroCandidates.length < 2) return;
    const interval = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroCandidates.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [heroCandidates.length]);

  const heroProduct = heroCandidates[heroIndex];
  const heroImage = heroProduct?.image || '';

  const categories = [
    { name: 'Pure Ghee Sweets', sub: 'Motichoor & Mysore Pak' },
    { name: 'Kaju & Dry Fruit Mithai', sub: 'Kaju Katli & Rolls' },
    { name: 'Bengali Mithai', sub: 'Rasgulla & Cham Cham' },
    { name: 'Sugar-Free Mithai', sub: 'Anjeer & Khajur Barfi' },
    { name: 'Savouries & Namkeen', sub: 'Ratlami Sev & Murukku' },
    { name: 'Chaat & Hot Snacks', sub: 'Samosa & Dhokla' },
    { name: 'Festive Gifting Boxes', sub: 'Diwali & Wedding Hampers' },
    { name: 'Ladoo Specialties', sub: 'Besan, Paan & Gond Ladoo' }
  ];

  const categoryItems = categories
    .map((cat) => {
      const match = products.find((p) => p.category === cat.name && p.image);
      return {
        ...cat,
        image: match?.image || ''
      };
    })
    .filter((cat) => cat.image);

  const getCartQty = (productId: string) => {
    const item = cart.find((i) => i.product.product_id === productId);
    return item ? item.quantity : 0;
  };

  const handleBuyNow = (p: Product) => {
    addToCart(p, 1);
    setIsCheckoutOpen(true);
  };

  const trustPills = [
    { icon: ShieldCheck, label: 'FSSAI Certified' },
    { icon: Award, label: 'No White Sugar' },
    { icon: Clock, label: 'Fresh Daily Batch' }
  ];

  return (
    <div className="space-y-14 pb-20 bg-[#FAF8F5]">

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#FAF5EC] via-[#F5EEDD] to-[#ECE0CA] rounded-3xl border border-amber-900/10 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

            {/* Left — Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-900/10 border border-amber-800/20 text-amber-900 rounded-full text-xs font-bold uppercase tracking-widest w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Royal Mithai Boutique · 100% A2 Desi Ghee
              </div>

              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-[1.12]">
                Traditional Indian<br />
                <span className="text-amber-800 italic">Millet Laddus</span>
              </h1>

              <p className="text-stone-600 text-base leading-relaxed max-w-lg">
                Handcrafted daily by master Halwais using pure saffron, silver leaf, organic pistachios, and 100% Desi Ghee. Express delivery in 10–15 minutes!
              </p>

              {/* Trust pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                {trustPills.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 shadow-xs">
                    <Icon className="w-3.5 h-3.5 text-amber-700" />
                    {label}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveCustomerTab('products')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-950 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl group"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  Explore Menu
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => setActiveCustomerTab('about')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-amber-50 text-stone-900 font-semibold rounded-xl text-sm border border-stone-300 transition-all shadow-xs"
                >
                  Our Heritage
                </button>
              </div>
            </div>

            {/* Right — Image */}
            <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-0">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt="RILA Sweets"
                  className="w-full h-full object-cover lg:rounded-r-3xl"
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full rounded-r-3xl bg-stone-100 flex items-center justify-center text-stone-500 text-sm">
                  No hero image available
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-amber-700 font-bold text-xs uppercase tracking-widest block">Royal Selection</span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">Explore Our Categories</h2>
          </div>
          <button
            onClick={() => setActiveCustomerTab('products')}
            className="flex items-center gap-1 text-stone-700 hover:text-amber-800 font-semibold text-sm transition group"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categoryItems.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setSelectedCategory(cat.name); setActiveCustomerTab('products'); }}
              className="group flex flex-col items-center gap-2.5 p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-100 group-hover:border-amber-300 transition-colors shadow-xs">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <p className="font-bold text-xs text-stone-900 group-hover:text-amber-800 transition leading-snug">{cat.name}</p>
                <p className="text-[10px] text-stone-500 font-medium mt-0.5 leading-snug">{cat.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─── PROMO BANNERS ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm group p-8">
            <div className="relative z-10 space-y-3 max-w-xs">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                Pure Ghee Specials
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-900 leading-tight">
                Authentic Motichoor & Mysore Pak
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Made with 100% pure A2 Gir cow ghee, roasted chana besan, saffron, and cardamom. Freshly made every morning.
              </p>
              <button
                onClick={() => { setSelectedCategory('Pure Ghee Sweets'); setActiveCustomerTab('products'); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-950 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition shadow-md"
              >
                Shop Pure Ghee Sweets <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-[#F2EAD9] border border-amber-200 shadow-sm group p-8">
            <div className="relative z-10 space-y-3 max-w-xs">
              <span className="inline-block px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                Festive Gifting
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-900 leading-tight">
                Festive Dry Fruit & Sweet Hampers
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                Elegant wooden gift boxes packed with premium cashews, roasted almonds, Kaju Katli, and traditional sweets.
              </p>
              <button
                onClick={() => { setSelectedCategory('Festive Gifting Boxes'); setActiveCustomerTab('products'); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-950 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition shadow-md"
              >
                Explore Gift Hampers <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-amber-700 font-bold text-xs uppercase tracking-widest block">Handpicked Specialties</span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">Bestsellers & Specials</h2>
          </div>
          <button
            onClick={() => setActiveCustomerTab('products')}
            className="flex items-center gap-1 text-stone-700 hover:text-amber-800 font-semibold text-sm transition group"
          >
            Browse All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif-display font-bold text-stone-900 text-lg">No Products Yet</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-xs mx-auto">
              The store inventory is empty. Add products via the Admin ERP.
            </p>
            <button
              onClick={() => setCurrentPortal('admin')}
              className="mt-5 px-5 py-2.5 bg-stone-950 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition inline-flex items-center gap-2"
            >
              Open Admin ERP
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((p) => {
              const qty = getCartQty(p.product_id);
              return (
                <div
                  key={p.product_id}
                  className="product-card bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col group"
                >
                  {/* Image */}
                  <div
                    onClick={() => setSelectedProductForView(p)}
                    className="cursor-pointer relative bg-stone-50 flex items-center justify-center h-48 overflow-hidden border-b border-stone-100"
                  >
                    {p.discount > 0 && (
                      <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        {p.discount}% OFF
                      </span>
                    )}
                    <img
                      src={p.image}
                      alt={p.product_name}
                      className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="veg-badge" title="Pure Veg" />
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">{p.category}</span>
                      </div>
                      <h3
                        onClick={() => setSelectedProductForView(p)}
                        className="cursor-pointer font-serif-display font-bold text-base text-stone-900 line-clamp-1 hover:text-amber-800 transition"
                      >
                        {p.product_name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">{p.description}</p>
                    </div>

                    {/* Price + Actions */}
                    <div>
                      <div className="flex items-center justify-between mb-3 pt-3 border-t border-stone-100">
                        <div>
                          <span className="font-mono font-bold text-stone-900 text-base">{formatINR(p.price)}</span>
                          {p.original_price > p.price && (
                            <span className="font-mono text-xs text-stone-400 line-through ml-1.5">{formatINR(p.original_price)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-stone-700">{p.rating}</span>
                          <span>({p.reviews_count})</span>
                        </div>
                      </div>

                      {qty > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-stone-950 text-white rounded-xl p-1">
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
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            Buy
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="py-2.5 bg-stone-950 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Add to Bag
                          </button>
                          <button
                            onClick={() => handleBuyNow(p)}
                            className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            Buy
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
      </section>

    </div>
  );
};
