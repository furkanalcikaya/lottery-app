'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [language, setLanguage] = useState<'TR' | 'EN'>('TR');

  useEffect(() => {
    // Set initial language from i18n
    setLanguage(i18n.language as 'TR' | 'EN');
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleLanguage = () => {
    const newLang = language === 'TR' ? 'EN' : 'TR';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  if (!user) {
    return null;
  }

  // Get company name from user data
  const companyName = user.companyName || user.name || user.username;

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Company Name */}
            <div className="flex items-center">
              <h1 className="text-l font-bold text-white">
                {companyName}
              </h1>
            </div>
            
            {/* Right side - User info, Language selector, Logout */}
            <div className="flex items-center space-x-4">
              
              {/* Language Selector */}
              <div className="flex items-center">
                <button
                  onClick={toggleLanguage}
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <span className={language === 'TR' ? 'text-white' : 'text-gray-400'}>TR</span>
                  <span className="text-gray-500 mx-1">|</span>
                  <span className={language === 'EN' ? 'text-white' : 'text-gray-400'}>EN</span>
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {t('navbar.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 