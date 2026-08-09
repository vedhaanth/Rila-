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
  const { setActiveCustomerTab, addToCart, setSelectedProductForView, cart, updateCartQuantity, setIsCheckoutOpen, currentUser } = useApp();

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
  const heroTitle = heroProduct?.product_name || '';
  const heroHighlight = heroProduct?.category || '';
  const heroDescription = heroProduct?.description || '';
  const heroPrice = heroProduct ? formatINR(heroProduct.price) : '';

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
    <div className="space-y-14 pb-20 bg-[#F8EFE1] dark:bg-slate-950">

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 max-w-7xl mx-auto animate-fade-in">
        <div className="relative overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_30px_60px_-24px_rgba(15,23,42,0.16)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fff9f2] via-[#fff4e5] to-[#fff7ec] opacity-80" />
          <div className="absolute right-16 top-12 w-44 h-44 rounded-full bg-amber-500/12 blur-3xl animate-float-slow" />
          <div className="absolute left-8 bottom-10 w-24 h-24 rounded-full bg-stone-900/10 blur-3xl animate-float-slow animation-delay-2000" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
            <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6">
              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-amber-700 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Discover Products You'll Love
                </div>
                <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
                  Discover Products You'll Love
                </h1>
                <p className="max-w-2xl text-base text-slate-700 dark:text-slate-100 leading-relaxed">
                  Premium products, great value, and a shopping experience designed around you.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveCustomerTab('products')}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-stone-950 via-stone-900 to-stone-800 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_40px_-18px_rgba(17,24,39,0.8)] transition hover:-translate-y-0.5"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  onClick={() => setActiveCustomerTab('products')}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-amber-300 hover:text-amber-700"
                >
                  Explore Products
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {trustPills.map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-3xl border border-stone-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm card-animated">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                    <p className="text-xs text-slate-700">Trusted quality in every order.</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative min-h-[360px] lg:min-h-[440px] px-8 pb-8 pt-10 sm:px-10 sm:pt-12">
              <div className="absolute -left-8 top-12 w-28 h-28 rounded-full bg-amber-500/10 blur-3xl animate-float-slow"></div>
              <div className="absolute right-6 top-24 w-20 h-20 rounded-full bg-white/80 blur-3xl animate-float-slow animate-pulse-soft"></div>
              <div className="relative h-full rounded-[32px] overflow-hidden border border-white/20 shadow-[0_24px_60px_-30px_rgba(17,24,39,0.15)] bg-[#F5E9D9] backdrop-blur-xl">
                {heroImage ? (
                  <img
                    key={heroImage}
                    src={heroImage}
                    alt={heroTitle}
                    className="h-full w-full object-cover animate-scale-up"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">No hero image available</div>
                )}
                <div className="absolute inset-x-0 bottom-0 rounded-b-[32px] bg-gradient-to-t from-[#F5E9D9]/95 via-[#F5E9D9]/60 to-transparent p-6">
                  <div className="text-xs uppercase tracking-[0.3em] text-amber-700/90 mb-2">Featured selection</div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-700">{heroTitle}</p>
                      <p className="text-2xl font-bold text-slate-950">{heroHighlight}</p>
                    </div>
                    <div className="rounded-3xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">{heroPrice}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-amber-700 font-bold text-xs uppercase tracking-widest block">Royal Selection</span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-0.5">Explore Our Categories</h2>
          </div>
          <button
            onClick={() => setActiveCustomerTab('products')}
            className="flex items-center gap-1 text-stone-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 font-semibold text-sm transition group"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categoryItems.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setSelectedCategory(cat.name); setActiveCustomerTab('products'); }}
              className="group relative overflow-hidden rounded-[28px] bg-white border border-stone-200 p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl dark:bg-slate-900 dark:border-slate-700 card-animated"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="relative flex items-start gap-4">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm dark:border-slate-700">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                </div>
                <div className="relative z-10">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-amber-700 font-bold mb-2">{cat.sub}</p>
                  <h3 className="font-serif-display text-lg font-bold text-stone-950 dark:text-white leading-snug">{cat.name}</h3>
                  <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">Explore premium selections curated for every celebration.</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-amber-700">
                Explore
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─── PROMO BANNERS ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm group p-8 card-animated">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-800 hover:from-stone-900 hover:via-stone-800 hover:to-stone-700 text-white font-semibold text-xs rounded-2xl transition shadow-[0_10px_24px_-12px_rgba(17,24,39,0.55)]"
              >
                Shop Pure Ghee Sweets <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-[#F2EAD9] border border-amber-200 shadow-sm group p-8 card-animated">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-800 hover:from-stone-900 hover:via-stone-800 hover:to-stone-700 text-white font-semibold text-xs rounded-2xl transition shadow-[0_10px_24px_-12px_rgba(17,24,39,0.55)]"
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
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white mt-0.5">Bestsellers & Specials</h2>
          </div>
          <button
            onClick={() => setActiveCustomerTab('products')}
            className="flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 font-semibold text-sm transition group"
          >
            Browse All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {
          featuredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif-display font-bold text-stone-900 text-lg">No Products Yet</h3>
              <p className="text-sm text-stone-500 mt-1 max-w-xs mx-auto">
                The store inventory is empty. Add products via the Admin ERP.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((p) => {
                const qty = getCartQty(p.product_id);
                return (
                  <div
                    key={p.product_id}
                    className="product-card bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col group card-animated"
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
                              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-semibold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 shadow-[0_10px_24px_-12px_rgba(245,158,11,0.65)]"
                            >
                              Buy
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => addToCart(p, 1)}
                              className="py-2.5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-800 hover:from-stone-900 hover:via-stone-800 hover:to-stone-700 text-white font-semibold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 shadow-[0_10px_24px_-12px_rgba(17,24,39,0.55)]"
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
          )
        }
      </section >

    </div >
  );
};
