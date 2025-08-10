'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import ManualInputWithScan from '@/components/ManualInputWithScan';
import AnalysisResults from '@/components/AnalysisResults';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { AnalysisResult, BillData, billAnalyzer } from '@/lib/bill-analyzer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { t, language } = useLanguage();

  const handleDataSubmit = async (billData: BillData) => {
    setIsAnalyzing(true);
    
    try {
      const result = await billAnalyzer.analyzeBill(billData, language);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error appropriately
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!analysisResult ? (
          <>
            {isAnalyzing ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.stepAnalyzing}
                </h3>
                <p className="text-base text-gray-600">
                  {language === 'de' ? 'Analysiere Ihre Nebenkosten...' : 'Analyzing your utility costs...'}
                </p>
              </div>
            ) : (
              <ManualInputWithScan onAnalysisComplete={handleDataSubmit} />
            )}
          </>
        ) : (
          <AnalysisResults 
            result={analysisResult} 
            onNewAnalysis={() => setAnalysisResult(null)}
          />
        )}
      </main>


    </div>
  );
}
