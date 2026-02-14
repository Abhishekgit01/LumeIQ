'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, name };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      onAuthenticated(data.user);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7f0] flex items-center justify-center px-5 py-10 leaf-bg-pattern">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#2d8a4e] to-[#5cb85c] flex items-center justify-center shadow-lg shadow-[#2d8a4e]/20">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[28px] font-bold text-[#1a2e1a] tracking-[-0.02em]">
            LumeIQ
          </h1>
          <p className="mt-1 text-[14px] text-[#5e7a5e]">
            Green Fintech for a Sustainable Future
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-[#e8f5e8] rounded-[14px]">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all ${
              mode === 'login'
                ? 'bg-white text-[#2d8a4e] shadow-sm'
                : 'text-[#5e7a5e] hover:text-[#1a2e1a]'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#2d8a4e] shadow-sm'
                : 'text-[#5e7a5e] hover:text-[#1a2e1a]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="text-[12px] font-semibold text-[#5e7a5e] mb-1.5 block">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e7a5e]" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 rounded-[12px] bg-white border border-[#2d8a4e]/15 text-[14px] text-[#1a2e1a] placeholder:text-[#5e7a5e]/40 focus:outline-none focus:border-[#2d8a4e]/40 focus:ring-2 focus:ring-[#2d8a4e]/10 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-[12px] font-semibold text-[#5e7a5e] mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e7a5e]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-[12px] bg-white border border-[#2d8a4e]/15 text-[14px] text-[#1a2e1a] placeholder:text-[#5e7a5e]/40 focus:outline-none focus:border-[#2d8a4e]/40 focus:ring-2 focus:ring-[#2d8a4e]/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#5e7a5e] mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e7a5e]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter password'}
                required
                minLength={mode === 'signup' ? 6 : undefined}
                className="w-full pl-10 pr-12 py-3 rounded-[12px] bg-white border border-[#2d8a4e]/15 text-[14px] text-[#1a2e1a] placeholder:text-[#5e7a5e]/40 focus:outline-none focus:border-[#2d8a4e]/40 focus:ring-2 focus:ring-[#2d8a4e]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5e7a5e] hover:text-[#1a2e1a] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-[10px]"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-[14px] bg-gradient-to-r from-[#2d8a4e] to-[#5cb85c] text-white text-[15px] font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-[#2d8a4e]/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Log In' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#5e7a5e]/60 mt-6">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-[#2d8a4e] font-semibold hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
