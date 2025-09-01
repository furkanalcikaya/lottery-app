'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="text-center py-6 mt-6">
      <p className="text-[10px] md:text-sm text-gray-400">
        Copyright &copy; {currentYear} Tüm hakları saklıdır. | {' '}
        Bu web sitesi{' '}
        <a 
          href="https://linktr.ee/furkanalcikaya" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors underline"
        >
          Furkan Alçıkaya
        </a>
        {' '}tarafından geliştirilmiştir.
      </p>
    </footer>
  );
} 