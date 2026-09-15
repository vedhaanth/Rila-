import React from 'react';
import { Heart, ShieldCheck, Sparkles, Utensils } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 bg-transparent">
      {/* Header */}
      <div className="section-shell rounded-[28px] bg-white/80 px-6 sm:px-10 py-8 sm:py-10 text-center max-w-4xl mx-auto">
        <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-800 font-extrabold text-xs uppercase tracking-[0.3em] inline-block border border-amber-300 shadow-sm">
          The RILA Story
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-4">
          Mithai made for the moments that matter
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto mt-3">
          RILA brings the warmth of an Indian mithai counter to your doorstep. We make it easier to share pure ghee sweets, festive boxes, and timeless favourites with the people who make ordinary days feel special.
        </p>
      </div>

      {/* Brand story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-950 text-amber-50 rounded-[24px] space-y-4 border border-amber-500/30 shadow-xl">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl w-fit border border-amber-400/30">
            <Heart className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="font-serif-display text-2xl font-extrabold text-white">Made with meaning</h3>
          <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
            At RILA, sweets are more than a purchase. They are a thank-you, a welcome, a celebration, and a little piece of home. Every box is chosen to help you express those feelings beautifully.
          </p>
        </div>

        <div className="p-8 bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 text-slate-950 rounded-[24px] space-y-4 shadow-xl">
          <div className="p-3 bg-slate-950/20 text-slate-950 rounded-2xl w-fit">
            <Utensils className="w-6 h-6 text-slate-950" />
          </div>
          <h3 className="font-serif-display text-2xl font-extrabold text-slate-950">A fresher way to share</h3>
          <p className="text-xs text-slate-900/90 leading-relaxed font-bold">
            From classic Bengali favourites to kaju creations and festive hampers, our collection is curated for freshness, dependable quality, and quick delivery around Indiranagar and Bengaluru.
          </p>
        </div>
      </div>

      {/* Signature RILA moment */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-stretch">
        <div className="relative overflow-hidden rounded-[28px] bg-[#7f1d1d] px-7 sm:px-10 py-9 text-amber-50 shadow-xl">
          <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full border-[18px] border-amber-300/20" />
          <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full border-[22px] border-rose-300/10" />
          <span className="relative text-amber-300 font-extrabold text-xs uppercase tracking-[0.25em]">A note from RILA</span>
          <h2 className="relative font-serif-display text-3xl sm:text-4xl font-extrabold text-white mt-3 max-w-xl">
            Some celebrations arrive in a golden box.
          </h2>
          <p className="relative text-sm text-rose-100 leading-relaxed mt-4 max-w-xl">
            A first job. A new home. A festival call that turns into a long conversation. We believe the best gifts do not need a speech. They simply say, “I thought of you.” RILA is here to make that thought delicious.
          </p>
        </div>

        <div className="rounded-[28px] bg-white/80 border border-amber-200/70 px-7 sm:px-8 py-8 shadow-sm">
          <h2 className="font-serif-display text-2xl font-extrabold text-slate-900">The sweet ritual</h2>
          <div className="mt-6 space-y-5">
            <div className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-slate-950">1</span>
              <div>
                <h3 className="font-bold text-slate-900">Pick your feeling</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">A little indulgence, a warm welcome, or a box made for sharing.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-slate-950">2</span>
              <div>
                <h3 className="font-bold text-slate-900">Choose your mithai</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">Discover ghee-rich classics, kaju favourites, and festive surprises.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-slate-950">3</span>
              <div>
                <h3 className="font-bold text-slate-900">Send the sweetness</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">We take care of the rest, so your thought arrives fresh and on time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What customers can expect */}
      <div className="section-shell rounded-[28px] bg-white/75 border border-amber-200/70 px-6 sm:px-10 py-8 sm:py-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-amber-700 font-extrabold text-xs uppercase tracking-[0.25em]">Our promise</span>
          <h2 className="font-serif-display text-3xl font-extrabold text-slate-900 mt-2">The little RILA difference</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">A thoughtful experience from the first click to the last bite.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 text-center">
          <div className="space-y-2">
            <ShieldCheck className="w-7 h-7 mx-auto text-emerald-700" />
            <h3 className="font-bold text-slate-900">Honest quality</h3>
            <p className="text-xs text-slate-600 leading-relaxed">Clear products, reliable billing, and care in every order.</p>
          </div>
          <div className="space-y-2">
            <Sparkles className="w-7 h-7 mx-auto text-amber-600" />
            <h3 className="font-bold text-slate-900">Curated joy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">Familiar favourites and gift-worthy discoveries in one place.</p>
          </div>
          <div className="space-y-2">
            <Utensils className="w-7 h-7 mx-auto text-rose-600" />
            <h3 className="font-bold text-slate-900">Ready to share</h3>
            <p className="text-xs text-slate-600 leading-relaxed">Packed with care and delivered promptly across Bengaluru.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
