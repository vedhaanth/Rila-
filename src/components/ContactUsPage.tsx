import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, UtensilsCrossed, Sparkles } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Message Dispatched', 'Our RILA ERP support team will contact you shortly.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 bg-transparent">
      <div className="section-shell rounded-[28px] bg-white/80 px-6 sm:px-10 py-8 text-center max-w-3xl mx-auto">
        <span className="text-amber-700 font-extrabold text-xs uppercase tracking-[0.3em] block">We'd Love To Hear From You</span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
          Contact RILA Support
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-2">
          Have questions regarding organic product delivery, bulk hampers, GST invoices, or ERP billing?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-amber-200/80 shadow-md flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-700 rounded-2xl shrink-0 border border-amber-300">
              <Phone className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-xs">
              <h4 className="font-serif-display font-extrabold text-slate-900 text-base mb-1">Customer Hotline</h4>
              <p className="text-slate-600 font-medium">+1 (800) RILA-STORE (Organic Support)</p>
              <p className="text-slate-600 font-medium">+1 (800) 555-0288 (Dual Admin ERP Support)</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-amber-200/80 shadow-md flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-700 rounded-2xl shrink-0 border border-amber-300">
              <Mail className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-xs">
              <h4 className="font-serif-display font-extrabold text-slate-900 text-base mb-1">Email Inquiries</h4>
              <p className="text-slate-600 font-medium">care@rilastoreerp.com</p>
              <p className="text-slate-600 font-medium">billing@rilastoreerp.com</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-amber-200/80 shadow-md flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-700 rounded-2xl shrink-0 border border-amber-300">
              <MapPin className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-xs">
              <h4 className="font-serif-display font-extrabold text-slate-900 text-base mb-1">Central Hubs</h4>
              <p className="text-slate-600 font-medium">RILA Organic Hub, Central Estate, SF</p>
              <p className="text-slate-600 font-medium">Gourmet Spice & Jaggery Complex, NY</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 p-8 bg-white rounded-[24px] border border-amber-200/80 shadow-sm">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-serif-display font-extrabold text-slate-900 text-xl mb-4">Send Us A Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Organic product bulk order, gift hampers, or invoice assistance"
                  className="w-full px-4 py-3 rounded-2xl border border-amber-300 bg-amber-50/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can assist you..."
                  className="w-full px-4 py-3 rounded-2xl border border-amber-300 bg-amber-50/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl shadow-lg transition flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-slate-950" /> Send Message
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-300">
                <Send className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="font-serif-display font-extrabold text-slate-900 text-2xl">Message Received!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                Thank you for reaching out to RILA ERP support. We have received your message and sent a confirmation to <b>{email}</b>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-slate-950 text-amber-300 text-xs font-extrabold rounded-2xl shadow-md"
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
