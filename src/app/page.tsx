'use client';

import { useState } from 'react';
import { Upload, FileText, Calculator, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import AnalysisResults from '@/components/AnalysisResults';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { AnalysisResult } from '@/lib/bill-analyzer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { t } = useLanguage();

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <span className="text-sm text-gray-600">{t.forAllGermanCities}</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Premium
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t.heroTitle}
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {t.heroDescription}
              </p>
              
              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t.feature1Title}
                  </h3>
                  <p className="text-gray-600">
                    {t.feature1Description}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t.feature2Title}
                  </h3>
                  <p className="text-gray-600">
                    {t.feature2Description}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t.feature3Title}
                  </h3>
                  <p className="text-gray-600">
                    {t.feature3Description}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="text-center mb-6">
                <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.uploadTitle}
                </h3>
                <p className="text-gray-600">
                  {t.uploadDescription}
                </p>
              </div>
              
              <FileUpload 
                onAnalysisComplete={handleAnalysisComplete}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
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
                <li>API Zugang</li>
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
