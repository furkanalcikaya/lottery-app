'use client';

import '@/lib/i18n'; // Just import to ensure i18n is initialized

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  // i18n is already initialized in the lib file
  return <>{children}</>;
} 