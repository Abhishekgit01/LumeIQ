'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { login, signup } from '@/lib/localAuth';

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
      const result = mode === 'login'
        ? await login(email, password)
        : signup(email, password, name);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      onAuthenticated(result.user);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ios-bg)] flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[390px]"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 w-16 h-16 rounded-[20px] bg-gradient-to-br from-[var(--eco-green)] to-[var(--eco-dark)] flex items-center justify-center"
            style={{ boxShadow: '0 8px 24px rgba(48, 209, 88, 0.3)' }}>
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[34px] font-bold text-[var(--ios-label)] tracking-[-0.5px]">
            LumeIQ
          </h1>
          <p className="mt-1 text-[15px] text-[var(--ios-tertiary-label)]">
            Green Fintech for a Sustainable Future
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex p-[3px] bg-[var(--ios-card)] rounded-[10px] mb-6"
          style={{ boxShadow: 'inset 0 0 0 0.5px var(--ios-separator)' }}>
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className="flex-1 py-2 rounded-[8px] text-[13px] font-semibold transition-all ios-press"
              style={{
                background: mode === m ? 'var(--ios-grouped-secondary)' : 'transparent',
                color: mode === m ? 'var(--ios-label)' : 'var(--ios-tertiary-label)',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)' : 'none',
              }}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="ios-card" style={{ boxShadow: '0 0 0 0.5px var(--ios-separator)' }}>
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center px-4 py-3">
                    <User className="w-5 h-5 text-[var(--ios-tertiary-label)] mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Name"
                      className="flex-1 bg-transparent text-[17px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] outline-none"
                    />
                  </div>
                  <div className="ios-separator" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center px-4 py-3">
              <Mail className="w-5 h-5 text-[var(--ios-tertiary-label)] mr-3 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="flex-1 bg-transparent text-[17px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] outline-none"
              />
            </div>
            <div className="ios-separator" />
            <div className="flex items-center px-4 py-3">
              <Lock className="w-5 h-5 text-[var(--ios-tertiary-label)] mr-3 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={mode === 'signup' ? 6 : undefined}
                className="flex-1 bg-transparent text-[17px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 ios-press"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-[var(--ios-tertiary-label)]" /> : <Eye className="w-5 h-5 text-[var(--ios-tertiary-label)]" />}
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
                className="text-[13px] text-[var(--ios-red)] mt-3 px-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 py-3.5 rounded-[14px] text-[17px] font-semibold disabled:opacity-50 flex items-center justify-center gap-2 ios-press transition-all"
            style={{
              background: 'var(--ios-blue)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
            }}
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

        <p className="text-center text-[13px] text-[var(--ios-tertiary-label)] mt-6">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-[var(--ios-blue)] font-semibold"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
