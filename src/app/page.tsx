'use client';

import { useState } from 'react';
import { Upload, FileText, Calculator, TrendingUp, Shield, CheckCircle } from 'lucide-react';
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{t.title}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <LanguageSwitcher />
              <span className="hidden lg:inline text-sm text-gray-600">{t.forAllGermanCities}</span>
              <button className="bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Premium
              </button>
            </div>
          </div>
          {/* Mobile info banner */}
          <div className="lg:hidden mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">{t.forAllGermanCities}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-12 px-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {t.heroTitle}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                {t.heroDescription}
              </p>
              
              {/* Features */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 px-2">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {t.feature1Title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t.feature1Description}
                  </p>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {t.feature2Title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t.feature2Description}
                  </p>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {t.feature3Title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t.feature3Description}
                  </p>
                </div>
              </div>
            </div>

            {/* Manual Input Section */}
            <div className="mx-2 sm:mx-0">
              {isAnalyzing ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {t.stepAnalyzing}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {language === 'de' ? 'Analysiere Ihre Nebenkosten mit aktuellen 2025 Daten...' : 'Analyzing your utility costs with current 2025 data...'}
                  </p>
                </div>
              ) : (
                <ManualInputWithScan onAnalysisComplete={handleDataSubmit} />
              )}
            </div>

            {/* Trust Indicators */}
            <div className="bg-white rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Vertrauenswürdige Datenquellen
              </h3>
              <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Bundesnetzagentur (SMARD)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Deutscher Mieterbund</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Stadtwerke APIs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Fraunhofer Institut</span>
                </div>
              </div>
            </div>

            {/* Pricing Preview */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                🆓 Erste Analyse kostenlos • Premium ab €9.99/Monat für unbegrenzte Analysen
              </p>
              <div className="text-sm text-gray-500">
                Über 50.000 deutsche Mieter vertrauen bereits auf unsere Analysen
              </div>
            </div>
          </>
        ) : (
          /* Analysis Results */
          <AnalysisResults 
            result={analysisResult} 
            onNewAnalysis={() => setAnalysisResult(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold mb-3">NebenKosten-Checker</h4>
              <p className="text-gray-400 text-sm">
                Deutschlands führender Service für Nebenkostenprüfung
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Service</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>Kostenlose Analyse</li>
                <li>Premium Features</li>
                <li><a href="/api-status" className="hover:text-white transition-colors">🔍 Data Verification</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Rechtliches</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>Datenschutz</li>
                <li>Impressum</li>
                <li>AGB</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Kontakt</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>support@nebenkosten-checker.de</li>
                <li>+49 30 12345678</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
            © 2025 NebenKosten-Checker. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
