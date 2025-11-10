import { getTexts } from '@/lib/i18n';

export default function SignUpPage() {
  const t = getTexts();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-lg transform transition-all hover:scale-[1.01]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.auth.signup.title}</h1>
          <p className="text-gray-600">{t.auth.signup.subtitle}</p>
        </div>
        
        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t.auth.signup.name}
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder={t.auth.signup.placeholders.name}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t.auth.signup.email}
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder={t.auth.signup.placeholders.email}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t.auth.signup.password}
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder={t.auth.signup.placeholders.password}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t.auth.signup.confirmPassword}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder={t.auth.signup.placeholders.password}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
              {t.auth.signup.terms}
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t.auth.signup.submit}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          {t.auth.signup.haveAccount}{' '}
          <a href="/login" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
            {t.auth.signup.loginLink}
          </a>
        </p>
      </div>
    </div>
  );
}