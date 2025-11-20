"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTexts } from '@/lib/i18n';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginContent() {
  const t = getTexts();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('message');

    if (error) {
      setMessage({ type: 'error', text: decodeURIComponent(error) });
    } else if (success) {
      setMessage({ type: 'success', text: decodeURIComponent(success) });
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (res.ok && json.ok) {
        // Login successful -> redirect to /stats
        router.push('/stats');
        return;
      }

      setMessage({ type: 'error', text: json.error || 'Login failed' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-lg transform transition-all hover:scale-[1.01]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.auth.login.title}</h1>
          <p className="text-gray-600">{t.auth.login.subtitle}</p>
        </div>

        {message ? (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t.auth.login.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder={t.auth.login.emailPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t.auth.login.password}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder={t.auth.login.passwordPlaceholder}
              />
              <button
                type="button"
                aria-label={showPassword ? t.auth.login.hidePassword : t.auth.login.showPassword}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500" />
              <span className="ml-2 text-gray-600">{t.auth.login.remember}</span>
            </label>
            <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors cursor-pointer">
              {t.auth.login.forgot}
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : t.auth.login.submit}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          {t.auth.login.noAccount}{' '}
          <a href="/signup" className="text-blue-500 hover:text-blue-600 font-medium transition-colors cursor-pointer">
            {t.auth.login.signupLink}
          </a>
        </p>
      </div>
    </div>
  );
}
