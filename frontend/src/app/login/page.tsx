"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (action: 'login' | 'signup') => {
    setLoading(true);
    setError(null);
    try {
      if (action === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Signup successful! You can now log in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-bg)] relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-brand-purple)] opacity-20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-brand-blue)] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="z-10 w-full max-w-md p-8 glass-panel rounded-2xl border border-[var(--color-brand-purple)]/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-2 mb-2">
            <span className="text-glow-purple text-[var(--color-brand-purple-glow)]">Helios</span> AI
          </h1>
          <p className="text-sm text-[#94a3b8]">Authenticate to access your telemetry</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">EMAIL</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-[#334155] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-purple)] transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-[#334155] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-purple)] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={() => handleAuth('login')}
              disabled={loading}
              className="w-full bg-[var(--color-brand-purple)] hover:bg-[#a855f7] text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_15px_var(--color-brand-purple-glow)] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            <button 
              onClick={() => handleAuth('signup')}
              disabled={loading}
              className="w-full glass-panel hover:text-white text-[#cbd5e1] font-semibold py-3 rounded-xl transition-colors border-transparent disabled:opacity-50"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
