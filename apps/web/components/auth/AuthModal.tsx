'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import type { User } from '@vorarlberg-peaks/types';
import { t as texts } from '@/lib/i18n';

interface AuthModalProps {
  onClose?: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload = tab === 'login' ? { email, password } : { email, username, password };
      const { data } = await apiClient.post<{ accessToken: string; user: User }>(endpoint, payload);
      login(data.accessToken, data.user);
      onClose?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? texts.common.errorGeneric));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">⛰️</span>
            <h1 className="text-lg font-bold text-gray-900">Vorarlberg Peaks</h1>
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {(['login', 'register'] as const).map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => { setTab(tabKey); setError(''); }}
                className={[
                  'flex-1 py-1.5 text-sm font-medium rounded-md transition-all',
                  tab === tabKey ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {tabKey === 'login' ? texts.auth.signIn : texts.auth.createAccount}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{texts.auth.email}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="you@example.com"
              />
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{texts.auth.username}</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={texts.auth.usernamePlaceholder}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{texts.auth.password}</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? texts.common.loading : tab === 'login' ? texts.auth.signIn : texts.auth.createAccount}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 px-6 py-4 border-t border-gray-100">
          {texts.auth.tagline}
        </p>
      </div>
    </div>
  );
}
