import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { X, Eye, EyeOff, ArrowRight, Lock, Mail, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const evaluatePassword = (value: string) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    if (value.length >= 10 && hasUpper && hasNumber && hasSpecial) {
      return 'Strong';
    }
    if (value.length >= 8 && (hasUpper || hasNumber || hasSpecial)) {
      return 'Medium';
    }
    return 'Weak';
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(evaluatePassword(value));
    setError('');
  };

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setIsSubmitting(false);
        return;
      }
      if (password.trim().length < 8) {
        setError('Password must contain at least 8 characters.');
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsSubmitting(false);
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
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Try Admin / Employee Login
    try {
      const res = await api.loginAdmin(email.trim(), password.trim());
      if (res?.user_type === 'employee' || res?.employee_id) {
        loginAsOrderManager(res);
        setIsSubmitting(false);
        return;
      } else if (res?.user_type === 'admin' || res?.admin_id) {
        loginAsAdmin(res);
        setIsSubmitting(false);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-2xl border border-stone-200/90 bg-white/90 text-stone-900 text-sm font-medium placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-400/25 transition shadow-[0_6px_16px_-10px_rgba(120,53,15,0.25)]';

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.8)] backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-[32px] bg-white/95 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl border border-white/20 animate-scale-up dark:bg-slate-950/95 dark:border-slate-700">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-slate-900 to-amber-700 p-10 text-white flex flex-col justify-between gap-8 sm:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.25),_transparent_30%)] opacity-90" />
            <div className="absolute -left-16 top-12 h-52 w-52 rounded-full bg-white/10 blur-3xl animate-float-slow" />
            <div className="absolute right-12 bottom-16 h-32 w-32 rounded-full bg-white/5 blur-3xl animate-pulse-soft" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <img src={rilaLogo} alt="RILA Logo" className="h-12 w-auto rounded-2xl border border-white/20 bg-white/10 p-1" />
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-200/90">Premium Login</p>
                  <h2 className="font-serif-display text-3xl font-bold tracking-tight">{isRegisterMode ? 'Create Your Account' : 'Welcome Back'}</h2>
                </div>
              </div>
              <p className="max-w-sm text-sm text-stone-200/90 leading-relaxed">
                {isRegisterMode
                  ? 'Join us and discover a better way to shop with exclusive access to premium products.'
                  : 'Your next favorite product is waiting for you. Sign in and continue your premium shopping experience.'}
              </p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
                <div className="flex items-center gap-3 text-amber-100 font-semibold">
                  <Sparkles className="w-5 h-5" />
                  <span>{isRegisterMode ? 'Fast account setup' : 'Secure access'}</span>
                </div>
                <p className="text-xs text-stone-200/80 mt-2">Login or register with confidence. We keep your account secure and orders effortless.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
                <div className="flex items-center gap-3 text-amber-100 font-semibold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Secure shopping</span>
                </div>
                <p className="text-xs text-stone-200/80 mt-2">All customer data and transaction flows stay on the existing backend connection.</p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 relative bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-500">{isRegisterMode ? 'New Account' : 'Sign In'}</p>
                <h3 className="text-2xl font-bold text-stone-950 dark:text-white">{isRegisterMode ? 'Create your account' : 'Welcome back'}</h3>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 text-stone-500 transition hover:border-amber-300 hover:text-stone-900 dark:border-slate-700 dark:text-stone-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-7 text-xs font-semibold text-stone-500">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setError(''); }}
                className={`rounded-full px-4 py-2 transition ${!isRegisterMode ? 'bg-amber-500 text-slate-950 shadow-[0_10px_30px_-20px_rgba(245,158,11,0.8)]' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-900 dark:text-stone-300 dark:hover:bg-slate-800'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setError(''); }}
                className={`rounded-full px-4 py-2 transition ${isRegisterMode ? 'bg-amber-500 text-slate-950 shadow-[0_10px_30px_-20px_rgba(245,158,11,0.8)]' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-900 dark:text-stone-300 dark:hover:bg-slate-800'}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode && (
                <>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      placeholder="Full Name"
                      className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-12 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(''); }}
                      placeholder="Phone Number"
                      className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); setError(''); }}
                      placeholder="Shipping Address"
                      className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="Email"
                  className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-12 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder={isRegisterMode ? 'Choose a password' : 'Password'}
                  className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-12 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 items-center justify-center -translate-y-1/2 rounded-full bg-stone-100 text-stone-500 transition hover:bg-stone-200 dark:bg-slate-900 dark:text-stone-300 dark:hover:bg-slate-800"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {isRegisterMode && (
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Confirm Password"
                    className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              )}

              {isRegisterMode && (
                <div className="rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 dark:border-slate-700 dark:bg-slate-900 dark:text-stone-300">
                  <div className="flex items-center justify-between">
                    <span>Password strength</span>
                    <span className={`font-semibold ${passwordStrength === 'Strong' ? 'text-emerald-600' : passwordStrength === 'Medium' ? 'text-amber-500' : 'text-rose-500'}`}>
                      {passwordStrength}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-stone-200 overflow-hidden dark:bg-slate-700">
                    <div className={`h-full rounded-full ${passwordStrength === 'Strong' ? 'bg-emerald-500 w-full' : passwordStrength === 'Medium' ? 'bg-amber-500 w-3/4' : 'bg-rose-500 w-1/3'}`} />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-rose-600 font-medium">{error}</p>
              )}

              <div className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-300">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe((prev) => !prev)}
                    className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                  />
                  Remember me
                </label>
                {!isRegisterMode && (
                  <button type="button" className="text-amber-600 font-semibold hover:text-amber-700 transition">Forgot Password?</button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-amber-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_40px_-16px_rgba(17,24,39,0.75)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (isRegisterMode ? 'Creating Account…' : 'Signing In…') : isRegisterMode ? 'Create Account' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
              {isRegisterMode ? (
                <>Already have an account? <button type="button" onClick={() => setIsRegisterMode(false)} className="font-semibold text-amber-600 hover:text-amber-700">Login</button></>
              ) : (
                <>Don’t have an account? <button type="button" onClick={() => setIsRegisterMode(true)} className="font-semibold text-amber-600 hover:text-amber-700">Register</button></>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
