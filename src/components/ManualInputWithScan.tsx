'use client';

import { useState, useRef } from 'react';
import { MapPin, Euro, Calculator, Camera, Upload, Loader2, TrendingUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BillData, billAnalyzer } from '@/lib/bill-analyzer';
import { OCRPreprocessor } from '@/lib/ocr-preprocessor';
import { PDFProcessor } from '@/lib/pdf-processor';
import CostCalculator from './CostCalculator';
import Tesseract from 'tesseract.js';

interface ManualInputWithScanProps {
  onAnalysisComplete: (data: BillData) => void;
}

export default function ManualInputWithScan({ onAnalysisComplete }: ManualInputWithScanProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    plz: '',
    apartmentSize: '',
    heating: '',
    water: '',
    waste: '',
    maintenance: '',
    period: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCalculatedCost = (category: string, costPerM2: number) => {
    setFormData(prev => ({ ...prev, [category]: costPerM2.toFixed(2) }));
    if (errors[category]) {
      setErrors(prev => ({ ...prev, [category]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // PLZ validation
    if (!formData.plz || formData.plz.length !== 5 || !/^\d{5}$/.test(formData.plz)) {
      newErrors.plz = language === 'de' 
        ? 'Bitte geben Sie eine gültige 5-stellige deutsche Postleitzahl ein'
        : 'Please enter a valid 5-digit German postal code';
    }

    // Apartment size validation
    if (!formData.apartmentSize || parseFloat(formData.apartmentSize) < 10 || parseFloat(formData.apartmentSize) > 500) {
      newErrors.apartmentSize = language === 'de'
        ? 'Bitte geben Sie eine Wohnungsgröße zwischen 10-500 m² ein'
        : 'Please enter apartment size between 10-500 m²';
    }

    // Cost validation with realistic ranges
    const heating = parseFloat(formData.heating || '0');
    const water = parseFloat(formData.water || '0');
    const waste = parseFloat(formData.waste || '0');
    const maintenance = parseFloat(formData.maintenance || '0');

    if (heating > 0 && (heating < 0.50 || heating > 5.00)) {
      newErrors.heating = language === 'de'
        ? 'Heizkosten sollten zwischen €0.50-5.00/m²/Monat liegen'
        : 'Heating costs should be between €0.50-5.00/m²/month';
    }

    if (water > 0 && (water < 0.20 || water > 2.00)) {
      newErrors.water = language === 'de'
        ? 'Wasserkosten sollten zwischen €0.20-2.00/m²/Monat liegen'
        : 'Water costs should be between €0.20-2.00/m²/month';
    }

    if (waste > 0 && (waste < 0.10 || waste > 1.00)) {
      newErrors.waste = language === 'de'
        ? 'Müllkosten sollten zwischen €0.10-1.00/m²/Monat liegen'
        : 'Waste costs should be between €0.10-1.00/m²/month';
    }

    if (maintenance > 0 && (maintenance < 0.30 || maintenance > 3.00)) {
      newErrors.maintenance = language === 'de'
        ? 'Wartungskosten sollten zwischen €0.30-3.00/m²/Monat liegen'
        : 'Maintenance costs should be between €0.30-3.00/m²/month';
    }

    const totalCosts = heating + water + waste + maintenance;

    if (totalCosts === 0) {
      newErrors.costs = language === 'de'
        ? 'Bitte geben Sie mindestens eine Kostenkategorie ein'
        : 'Please enter at least one cost category';
    }

    if (totalCosts > 0 && totalCosts < 1.00) {
      newErrors.costs = language === 'de'
        ? 'Gesamtkosten scheinen zu niedrig. Bitte überprüfen Sie Ihre Eingaben.'
        : 'Total costs seem too low. Please check your entries.';
    }

    if (totalCosts > 12.00) {
      newErrors.costs = language === 'de'
        ? 'Gesamtkosten scheinen sehr hoch. Bitte überprüfen Sie Ihre Eingaben.'
        : 'Total costs seem very high. Please verify your entries.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const apartmentSize = parseFloat(formData.apartmentSize);
    const heatingPerM2 = parseFloat(formData.heating || '0');
    const waterPerM2 = parseFloat(formData.water || '0');
    const wastePerM2 = parseFloat(formData.waste || '0');
    const maintenancePerM2 = parseFloat(formData.maintenance || '0');

    // Convert per-m² costs back to total monthly costs for the apartment
    const totalMonthlyCosts = {
      heating: heatingPerM2 * apartmentSize,
      water: waterPerM2 * apartmentSize,
      waste: wastePerM2 * apartmentSize,
      maintenance: maintenancePerM2 * apartmentSize
    };

    const billData: BillData = {
      plz: formData.plz,
      apartmentSize: apartmentSize,
      totalAmount: totalMonthlyCosts.heating + totalMonthlyCosts.water + totalMonthlyCosts.waste + totalMonthlyCosts.maintenance,
      address: `${formData.plz}, Germany`,
      costs: {
        heating: totalMonthlyCosts.heating,
        water: totalMonthlyCosts.water,
        waste: totalMonthlyCosts.waste,
        maintenance: totalMonthlyCosts.maintenance,
        electricity: 0,
        other: 0
      },
      period: formData.period
    };

    onAnalysisComplete(billData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleScanAssist = async (file: File) => {
    setIsScanning(true);
    setScanProgress(0);

    try {
      setScanProgress(20);
      
      let processedImageUrl: string;
      
      // Handle PDF files differently
      if (PDFProcessor.isPDFFile(file)) {
        processedImageUrl = await PDFProcessor.extractTextFromPDF(file);
        setScanProgress(40);
      } else {
        processedImageUrl = await OCRPreprocessor.preprocessImage(file);
        setScanProgress(40);
      }

      // OCR processing
      const { data: { text } } = await Tesseract.recognize(processedImageUrl, 'deu', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(40 + (m.progress * 50));
          }
        }
      });

      setScanProgress(90);

      // Extract data and pre-fill form
      const extractedData = await billAnalyzer.extractBillData(text);
      
      // Pre-fill form with extracted data
      if (extractedData.plz) {
        setFormData(prev => ({ ...prev, plz: extractedData.plz! }));
      }
      if (extractedData.apartmentSize) {
        setFormData(prev => ({ ...prev, apartmentSize: extractedData.apartmentSize!.toString() }));
      }
      
      // Convert extracted costs to per m²/month if we have apartment size
      if (extractedData.apartmentSize && extractedData.costs) {
        const apartmentSize = extractedData.apartmentSize;
        const monthsInPeriod = extractedData.period ? 
          Math.max(1, Math.round(Math.abs(new Date(extractedData.period.end).getTime() - new Date(extractedData.period.start).getTime()) / (1000 * 60 * 60 * 24 * 30.44))) : 12;
        
        if (extractedData.costs.heating) {
          const monthlyPerM2 = extractedData.costs.heating / apartmentSize / monthsInPeriod;
          setFormData(prev => ({ ...prev, heating: monthlyPerM2.toFixed(2) }));
        }
        if (extractedData.costs.water) {
          const monthlyPerM2 = extractedData.costs.water / apartmentSize / monthsInPeriod;
          setFormData(prev => ({ ...prev, water: monthlyPerM2.toFixed(2) }));
        }
        if (extractedData.costs.waste) {
          const monthlyPerM2 = extractedData.costs.waste / apartmentSize / monthsInPeriod;
          setFormData(prev => ({ ...prev, waste: monthlyPerM2.toFixed(2) }));
        }
        if (extractedData.costs.maintenance) {
          const monthlyPerM2 = extractedData.costs.maintenance / apartmentSize / monthsInPeriod;
          setFormData(prev => ({ ...prev, maintenance: monthlyPerM2.toFixed(2) }));
        }
      }

      setScanProgress(100);
      
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Scan assist failed:', error);
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleScanAssist(file);
    }
  };

  const quickFillValues = (preset: 'low' | 'average' | 'high') => {
    const presets = {
      low: { heating: '1.00', water: '0.45', waste: '0.25', maintenance: '0.80' },
      average: { heating: '1.50', water: '0.65', waste: '0.35', maintenance: '1.20' },
      high: { heating: '2.50', water: '1.00', waste: '0.50', maintenance: '1.80' }
    };
    
    setFormData(prev => ({ ...prev, ...presets[preset] }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Calculator className="h-10 w-10 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">
            {language === 'de' ? 'Nebenkosten Rechner' : 'Utility Cost Calculator'}
          </h3>
        </div>
        
        {/* Quick Scan Options */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
            disabled={isScanning}
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            disabled={isScanning}
          />

          {isScanning ? (
            <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Scanning... {scanProgress}%</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Camera className="h-4 w-4" />
                <span>📸 Quick Scan</span>
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <Upload className="h-4 w-4" />
                <span>📄 Upload</span>
              </button>
            </>
          )}
        </div>
        
        <p className="text-xs text-gray-500">
          {language === 'de' ? '💡 Optional: Scannen zum automatischen Ausfüllen' : '💡 Optional: Scan to auto-fill fields'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Basic Information */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
          <h4 className="text-lg font-semibold text-blue-900 flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5" />
            <span>{language === 'de' ? 'Schritt 1: Grunddaten' : 'Step 1: Basic Information'}</span>
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {/* PLZ Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'de' ? 'Postleitzahl (PLZ) *' : 'German Postal Code (PLZ) *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.plz}
                  onChange={(e) => updateField('plz', e.target.value.slice(0, 5))}
                  placeholder={language === 'de' ? 'z.B. 10115' : 'e.g., 10115'}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono ${
                    errors.plz ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  maxLength={5}
                  pattern="[0-9]{5}"
                />
                {formData.plz.length === 5 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.plz && (
                <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                  <span>⚠️</span><span>{errors.plz}</span>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {language === 'de' ? 'Berlin: 10115, München: 80331, Hamburg: 20095' : 'Berlin: 10115, Munich: 80331, Hamburg: 20095'}
              </p>
            </div>

            {/* Apartment Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'de' ? 'Wohnungsgröße (m²) *' : 'Apartment Size (m²) *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.apartmentSize}
                  onChange={(e) => updateField('apartmentSize', e.target.value)}
                  placeholder={language === 'de' ? 'z.B. 75' : 'e.g., 75'}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                    errors.apartmentSize ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  min="10"
                  max="500"
                  step="0.1"
                />
                {formData.apartmentSize && parseFloat(formData.apartmentSize) >= 10 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.apartmentSize && (
                <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                  <span>⚠️</span><span>{errors.apartmentSize}</span>
                </p>
              )}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{language === 'de' ? '1 Zimmer: ~30m²' : '1 room: ~30m²'}</span>
                <span>{language === 'de' ? '3 Zimmer: ~75m²' : '3 rooms: ~75m²'}</span>
                <span>{language === 'de' ? '5 Zimmer: ~120m²' : '5 rooms: ~120m²'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Cost Information */}
        <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
          <h4 className="text-lg font-semibold text-green-900 flex items-center space-x-2 mb-4">
            <Euro className="h-5 w-5" />
            <span>{language === 'de' ? 'Schritt 2: Monatliche Kosten (€/m²/Monat)' : 'Step 2: Monthly Costs (€/m²/month)'}</span>
          </h4>
          
          <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 mb-3">
              <strong>{language === 'de' ? '💡 Berechnung:' : '💡 Calculation:'}</strong> 
              {language === 'de' ? ' Gesamtkosten ÷ Wohnungsgröße = €/m²/Monat' : ' Total costs ÷ apartment size = €/m²/month'}
            </p>
            <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
              <strong>{language === 'de' ? 'Beispiel:' : 'Example:'}</strong> 
              {language === 'de' ? ' 75m² Wohnung, €150/Monat Heizung → 150 ÷ 75 = 2.00' : ' 75m² apartment, €150/month heating → 150 ÷ 75 = 2.00'}
            </div>
          </div>
          
          {/* Quick Fill Buttons */}
          {formData.apartmentSize && parseFloat(formData.apartmentSize) > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                {language === 'de' ? '⚡ Schnelleingabe für typische Werte:' : '⚡ Quick fill with typical values:'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => quickFillValues('low')}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors font-medium"
                >
                  💚 {language === 'de' ? 'Niedrige Kosten' : 'Low Costs'}
                </button>
                <button
                  type="button"
                  onClick={() => quickFillValues('average')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors font-medium"
                >
                  🏠 {language === 'de' ? 'Durchschnitt' : 'Average'}
                </button>
                <button
                  type="button"
                  onClick={() => quickFillValues('high')}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors font-medium"
                >
                  🔥 {language === 'de' ? 'Hohe Kosten' : 'High Costs'}
                </button>
              </div>
            </div>
          )}
          
          {/* Cost Input Grid */}
          <div className="grid gap-4">
            {/* Heating */}
            <div className="bg-white border-2 border-orange-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-semibold text-orange-800 flex items-center space-x-2">
                  <span className="text-2xl">🔥</span>
                  <span>{language === 'de' ? 'Heizung' : 'Heating'}</span>
                </label>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  {language === 'de' ? 'Meist höchste Kosten' : 'Usually highest cost'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={formData.heating}
                  onChange={(e) => updateField('heating', e.target.value)}
                  placeholder="1.50"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg ${
                    errors.heating ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  min="0"
                  max="5"
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  €/m²
                </div>
              </div>
              {errors.heating && (
                <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                  <span>⚠️</span><span>{errors.heating}</span>
                </p>
              )}
              <p className="text-xs text-orange-600 mt-2">
                {language === 'de' ? 'Typisch: €0.50-5.00/m²/Monat' : 'Typical: €0.50-5.00/m²/month'}
              </p>
            </div>

            {/* Water */}
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-semibold text-blue-800 flex items-center space-x-2">
                  <span className="text-2xl">💧</span>
                  <span>{language === 'de' ? 'Wasser' : 'Water'}</span>
                </label>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {language === 'de' ? 'Inkl. Abwasser' : 'Incl. sewage'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={formData.water}
                  onChange={(e) => updateField('water', e.target.value)}
                  placeholder="0.65"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                    errors.water ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  min="0"
                  max="2"
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  €/m²
                </div>
              </div>
              {errors.water && (
                <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                  <span>⚠️</span><span>{errors.water}</span>
                </p>
              )}
              <p className="text-xs text-blue-600 mt-2">
                {language === 'de' ? 'Typisch: €0.20-2.00/m²/Monat' : 'Typical: €0.20-2.00/m²/month'}
              </p>
            </div>

            {/* Waste */}
            <div className="bg-white border-2 border-green-200 rounded-lg p-4 hover:border-green-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-semibold text-green-800 flex items-center space-x-2">
                  <span className="text-2xl">🗑️</span>
                  <span>{language === 'de' ? 'Müllentsorgung' : 'Waste Management'}</span>
                </label>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  {language === 'de' ? 'Meist niedrigste' : 'Usually lowest'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={formData.waste}
                  onChange={(e) => updateField('waste', e.target.value)}
                  placeholder="0.35"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg ${
                    errors.waste ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  min="0"
                  max="1"
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  €/m²
                </div>
              </div>
              {errors.waste && (
                <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                  <span>⚠️</span><span>{errors.waste}</span>
                </p>
              )}
              <p className="text-xs text-green-600 mt-2">
                {language === 'de' ? 'Typisch: €0.10-1.00/m²/Monat' : 'Typical: €0.10-1.00/m²/month'}
              </p>
            </div>

            {/* Maintenance */}
            <div className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-semibold text-purple-800 flex items-center space-x-2">
                  <span className="text-2xl">🔧</span>
                  <span>{language === 'de' ? 'Wartung & Instandhaltung' : 'Maintenance & Repairs'}</span>
                </label>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                  {language === 'de' ? 'Sehr variabel' : 'Highly variable'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={formData.maintenance}
                  onChange={(e) => updateField('maintenance', e.target.value)}
                  placeholder="1.20"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg ${
                    errors.maintenance ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  min="0"
                  max="3"
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  €/m²
                </div>
              </div>
              {errors.maintenance && (
                <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                  <span>⚠️</span><span>{errors.maintenance}</span>
                </p>
              )}
              <p className="text-xs text-purple-600 mt-2">
                {language === 'de' ? 'Typisch: €0.30-3.00/m²/Monat' : 'Typical: €0.30-3.00/m²/month'}
              </p>
            </div>
          </div>
          
          {errors.costs && <p className="text-red-500 text-sm mt-4">{errors.costs}</p>}
          
          {/* Cost Calculator Helper */}
          {formData.apartmentSize && parseFloat(formData.apartmentSize) > 0 && (
            <div className="mt-6">
              <CostCalculator 
                apartmentSize={parseFloat(formData.apartmentSize)}
                onCalculatedCost={handleCalculatedCost}
              />
            </div>
          )}
        </div>

        {/* Step 3: Live Preview */}
        {formData.apartmentSize && parseFloat(formData.apartmentSize) > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
            <h4 className="text-lg font-semibold text-blue-900 flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5" />
              <span>{language === 'de' ? 'Schritt 3: Ihre Kostenübersicht' : 'Step 3: Your Cost Overview'}</span>
            </h4>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-1">
                      <span>🔥</span>
                      <span>{language === 'de' ? 'Heizung:' : 'Heating:'}</span>
                    </span>
                    <span className="font-bold text-orange-600">
                      €{((parseFloat(formData.heating || '0') * parseFloat(formData.apartmentSize)).toFixed(2))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-1">
                      <span>💧</span>
                      <span>{language === 'de' ? 'Wasser:' : 'Water:'}</span>
                    </span>
                    <span className="font-bold text-blue-600">
                      €{((parseFloat(formData.water || '0') * parseFloat(formData.apartmentSize)).toFixed(2))}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-1">
                      <span>🗑️</span>
                      <span>{language === 'de' ? 'Müll:' : 'Waste:'}</span>
                    </span>
                    <span className="font-bold text-green-600">
                      €{((parseFloat(formData.waste || '0') * parseFloat(formData.apartmentSize)).toFixed(2))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-1">
                      <span>🔧</span>
                      <span>{language === 'de' ? 'Wartung:' : 'Maintenance:'}</span>
                    </span>
                    <span className="font-bold text-purple-600">
                      €{((parseFloat(formData.maintenance || '0') * parseFloat(formData.apartmentSize)).toFixed(2))}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {language === 'de' ? 'Gesamt Monatlich:' : 'Total Monthly:'}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      €{((parseFloat(formData.heating || '0') + parseFloat(formData.water || '0') + parseFloat(formData.waste || '0') + parseFloat(formData.maintenance || '0')) * parseFloat(formData.apartmentSize)).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">
                      €{(parseFloat(formData.heating || '0') + parseFloat(formData.water || '0') + parseFloat(formData.waste || '0') + parseFloat(formData.maintenance || '0')).toFixed(2)}/m²/month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={!formData.plz || !formData.apartmentSize || (parseFloat(formData.heating || '0') + parseFloat(formData.water || '0') + parseFloat(formData.waste || '0') + parseFloat(formData.maintenance || '0')) === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-200 font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
          >
            <div className="flex items-center justify-center space-x-3">
              <Calculator className="h-7 w-7" />
              <span>
                {language === 'de' ? '🚀 Nebenkosten Analysieren' : '🚀 Analyze Utility Costs'}
              </span>
            </div>
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-3">
            {language === 'de' 
              ? '✅ Kostenlose Analyse mit offiziellen 2025-Daten aus ganz Deutschland'
              : '✅ Free analysis with official 2025 data from all of Germany'
            }
          </p>
        </div>
      </form>

      {/* Quick Help */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <div className="text-center">
          <h5 className="font-bold text-gray-900 mb-4">
            {language === 'de' ? '🤔 Brauchen Sie Hilfe?' : '🤔 Need Help?'}
          </h5>
          
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="text-blue-600 font-medium mb-1">
                {language === 'de' ? '📋 Rechnung finden' : '📋 Find Your Bill'}
              </div>
              <p className="text-gray-600 text-xs">
                {language === 'de' ? 'Nebenkostenabrechnung vom Vermieter' : 'Utility bill from landlord'}
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <div className="text-green-600 font-medium mb-1">
                {language === 'de' ? '🧮 Berechnen' : '🧮 Calculate'}
              </div>
              <p className="text-gray-600 text-xs">
                {language === 'de' ? 'Gesamtkosten ÷ Wohnungsgröße' : 'Total costs ÷ apartment size'}
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <div className="text-purple-600 font-medium mb-1">
                {language === 'de' ? '📊 Vergleichen' : '📊 Compare'}
              </div>
              <p className="text-gray-600 text-xs">
                {language === 'de' ? 'Mit aktuellen 2025-Daten' : 'With current 2025 data'}
              </p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            {language === 'de' 
              ? '🏛️ Basiert auf offiziellen Daten: SMARD, Corrently, Fraunhofer, Mieterbund'
              : '🏛️ Based on official data: SMARD, Corrently, Fraunhofer, Mieterbund'
            }
          </p>
        </div>
      </div>
    </div>
  );
}