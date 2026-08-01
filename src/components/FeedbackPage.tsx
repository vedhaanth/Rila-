import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Feedback } from '../types';
import { Star, MessageSquare, Send, CheckCircle2, MessageCircle } from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { addToast, currentUser } = useApp();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [rating, setRating] = useState(5);
  const [type, setType] = useState<'Review' | 'Suggestion' | 'Complaint'>('Review');
  const [message, setMessage] = useState('');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedbackList = async () => {
    const list = await api.getFeedback();
    setFeedbacks(list);
  };

  useEffect(() => {
    fetchFeedbackList();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await api.submitFeedback({
        customer_name: name || 'Customer',
        customer_email: email || 'customer@example.com',
        rating,
        type,
        message
      });

      addToast('Feedback Submitted', 'Thank you for reviewing your RILA Store experience!');
      setMessage('');
      fetchFeedbackList();
    } catch (err: any) {
      addToast('Submission Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-stone-50/50">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-amber-700 font-extrabold text-xs uppercase tracking-widest block">Customer Reviews & Feedback</span>
        <h1 className="font-serif-display text-4xl font-extrabold text-slate-900 tracking-tight">
          Community Voice & Reviews
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          Share your organic food, gift hamper, or store delivery experience with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="p-6 bg-white rounded-3xl border border-amber-200/80 shadow-md space-y-4">
          <h3 className="font-serif-display font-extrabold text-slate-900 text-xl">Share Your Experience</h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">Feedback Type</label>
              <div className="flex gap-2">
                {(['Review', 'Suggestion', 'Complaint'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-xl font-extrabold transition ${type === t ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-amber-50 text-slate-800 hover:bg-amber-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Your Rating</label>
              <div className="flex gap-1 cursor-pointer py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-6 h-6 transition ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-2xl border border-amber-300 bg-amber-50/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-2xl border border-amber-300 bg-amber-50/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Comments / Review Details</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about the purity, aroma, taste, packing, or delivery speed..."
                className="w-full px-4 py-3 rounded-2xl border border-amber-300 bg-amber-50/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-slate-950" /> Submit Review
            </button>
          </form>
        </div>

        {/* Feedback Wall */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif-display font-extrabold text-slate-900 text-2xl">Verified Customer Reviews</h3>

          <div className="space-y-4">
            {feedbacks.map((fbd) => (
              <div
                key={fbd.feedback_id}
                className="p-6 bg-white rounded-3xl border border-amber-200/80 shadow-md space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif-display font-extrabold text-slate-900 text-base">{fbd.customer_name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${fbd.type === 'Complaint' ? 'bg-red-100 text-red-700' : fbd.type === 'Suggestion' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {fbd.type}
                    </span>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < fbd.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed font-medium">{fbd.message}</p>

                {fbd.admin_reply && (
                  <div className="mt-3 p-3.5 bg-slate-950 rounded-2xl border border-amber-500/30 text-amber-50 flex items-start gap-2.5">
                    <MessageCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block mb-0.5">RILA ERP Management Reply:</span>
                      <p className="text-amber-100/90 font-medium">{fbd.admin_reply}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
