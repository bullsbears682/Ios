'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EnglishPage() {
  const { setLanguage } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    // Set language to English and redirect to main page
    setLanguage('en');
    router.push('/');
  }, [setLanguage, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading English version...</p>
      </div>
    </div>
  );
}