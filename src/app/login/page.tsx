'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'TR' | 'EN'>('TR');
  
  const { login, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Set initial language from i18n
    setLanguage(i18n.language as 'TR' | 'EN');
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'TR' ? 'EN' : 'TR';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(formData.companyName, formData.username, formData.password);
      } else {
        await login(formData.username, formData.password);
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md space-y-8">
        {/* Language Selector */}
        <div className="flex justify-center">
          <button
            onClick={toggleLanguage}
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
          >
            <span className={language === 'TR' ? 'text-white' : 'text-gray-400'}>TR</span>
            <span className="text-gray-500 mx-1">|</span>
            <span className={language === 'EN' ? 'text-white' : 'text-gray-400'}>EN</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('login.title')}
          </h1>
          <p className="text-gray-400">
            {isRegister ? t('login.subtitle_register') : t('login.subtitle_login')}
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('login.company_name')}
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required={isRegister}
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('login.placeholder_company')}
                />
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                {t('login.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('login.placeholder_username')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('login.placeholder_password')}
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:transform-none"
            >
              {loading 
                ? t('common.loading')
                : isRegister 
                  ? t('login.register_button')
                  : t('login.login_button')
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setFormData({ companyName: '', username: '', password: '' });
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {isRegister 
                ? t('login.switch_to_login')
                : t('login.switch_to_register')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 