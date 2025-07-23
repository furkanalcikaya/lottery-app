'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="text-center py-6 mt-6">
      <p className="text-[10px] md:text-sm text-gray-400">
        Copyright &copy; {currentYear} {t('footer.all_rights_reserved')} | {t('footer.website_by')} {' '}
        <a 
          href="https://linktr.ee/furkanalcikaya" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors underline"
        >
          Furkan Alçıkaya
        </a>
        {t('footer.website_by_furkan_alcikaya')}
      </p>
    </footer>
  );
} 