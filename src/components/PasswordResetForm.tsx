import React, { useState } from 'react';
import { Mail, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../services/api';

export const PasswordResetForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (!codeSent) {
        await api.requestPasswordReset(email.trim());
        setCodeSent(true);
        setMessage('A verification code was sent to your email. It expires in 15 minutes.');
        return;
      }

      if (password.length < 8) {
        setError('Password must contain at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      await api.resetPassword(email.trim(), code.trim(), password);
      setMessage('Password updated successfully. You can sign in now.');
      setCode('');
      setPassword('');
      setConfirmPassword('');
      setCodeSent(false);
    } catch (err: any) {
      setError(err.message || 'Unable to complete password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
        <div className="flex items-center gap-3 text-amber-900 font-bold">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          <span>Reset your password securely</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-amber-800">
          We will email a one-time verification code before changing your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="email"
            required
            value={email}
            disabled={codeSent}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Account email"
            className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-12 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {codeSent && (
          <>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder="6-digit verification code"
              className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm tracking-[0.3em] text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-12 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </>
        )}

        {message && <p className="text-sm font-medium text-emerald-700">{message}</p>}
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-amber-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_40px_-16px_rgba(17,24,39,0.75)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Please wait...' : codeSent ? 'Update Password' : 'Send Verification Code'}
        </button>
      </form>

      <button type="button" onClick={onBack} className="w-full text-center text-sm font-semibold text-amber-600 hover:text-amber-700">
        Back to Login
      </button>
    </div>
  );
};
