import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { X, Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';
import rilaLogo from '../assets/images/rila_logo.jpg';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginAsAdmin,
    loginAsCustomer,
    loginAsOrderManager
  } = useApp();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      try {
        const customer = await api.registerCustomer({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: phone.trim(),
          address: address.trim()
        });
        loginAsCustomer(customer);
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      }
      return;
    }

    // Try Admin / Employee Login
    try {
      const res = await api.loginAdmin(email.trim(), password.trim());
      if (res?.user_type === 'employee' || res?.employee_id) {
        loginAsOrderManager(res);
        return;
      } else if (res?.user_type === 'admin' || res?.admin_id) {
        loginAsAdmin(res.admin_id);
        return;
      }
    } catch (adminErr) {
      // Not an admin or employee, fall through to customer login
    }

    try {
      const customer = await api.loginCustomer(email.trim(), password.trim());
      loginAsCustomer(customer);
    } catch (err: any) {
      if (err.message && err.message.includes('not found')) {
        setError('Account not found. Use Register if you are a customer.');
      } else {
        setError(err.message || 'Login failed.');
      }
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm font-medium placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 transition';

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-100 overflow-hidden animate-scale-up">

        <div className="px-6 py-5 bg-stone-950 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <img src={rilaLogo} alt="RILA Logo" className="h-10 w-auto object-contain rounded-lg border border-stone-800 bg-white p-0.5" />
                <div>
                  <h3 className="font-serif-display font-black text-white text-lg leading-none">
                    {isRegisterMode ? 'Customer Register' : 'Login'}
                  </h3>
                  <p className="text-[11px] text-amber-400/80 font-medium mt-0.5">
                    {isRegisterMode
                      ? 'Create a customer account and save your order profile.'
                      : 'Use your email and password to login as customer or admin.'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setError(''); }}
                  className={`px-3 py-2 rounded-full transition ${!isRegisterMode ? 'bg-amber-500 text-slate-950' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setError(''); }}
                  className={`px-3 py-2 rounded-full transition ${isRegisterMode ? 'bg-amber-500 text-slate-950' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'}`}
                >
                  Register
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-500 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    placeholder="Full Name"
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(''); }}
                    placeholder="Phone Number"
                    className={inputClass}
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setError(''); }}
                    placeholder="Shipping Address"
                    className={inputClass}
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Email"
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder={isRegisterMode ? 'Choose a password' : 'Password'}
                className={`${inputClass} pl-10 pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium px-1">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-stone-950 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              {isRegisterMode ? 'Register' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
