'use client';

import { useState, useRef } from 'react';
import { MapPin, Home, Euro, Calculator, Camera, Upload, Scan, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BillData, billAnalyzer } from '@/lib/bill-analyzer';
import { OCRPreprocessor } from '@/lib/ocr-preprocessor';
import Tesseract from 'tesseract.js';

interface ManualInputWithScanProps {
  onAnalysisComplete: (data: BillData) => void;
}

export default function ManualInputWithScan({ onAnalysisComplete }: ManualInputWithScanProps) {
  const { t } = useLanguage();
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.plz || formData.plz.length !== 5 || !/^\d{5}$/.test(formData.plz)) {
      newErrors.plz = 'Please enter a valid 5-digit German postal code';
    }

    if (!formData.apartmentSize || parseFloat(formData.apartmentSize) < 10 || parseFloat(formData.apartmentSize) > 500) {
      newErrors.apartmentSize = 'Please enter apartment size between 10-500 m²';
    }

    const totalCosts = parseFloat(formData.heating || '0') + 
                      parseFloat(formData.water || '0') + 
                      parseFloat(formData.waste || '0') + 
                      parseFloat(formData.maintenance || '0');

    if (totalCosts === 0) {
      newErrors.costs = 'Please enter at least one cost category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const billData: BillData = {
      plz: formData.plz,
      apartmentSize: parseFloat(formData.apartmentSize),
      totalAmount: parseFloat(formData.heating || '0') + parseFloat(formData.water || '0') + parseFloat(formData.waste || '0') + parseFloat(formData.maintenance || '0'),
      address: `${formData.plz}, Germany`,
      costs: {
        heating: parseFloat(formData.heating || '0'),
        water: parseFloat(formData.water || '0'),
        waste: parseFloat(formData.waste || '0'),
        maintenance: parseFloat(formData.maintenance || '0'),
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
      
      // Preprocess image
      const processedImageUrl = await OCRPreprocessor.preprocessImage(file);
      setScanProgress(40);

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
      if (extractedData.costs?.heating) {
        setFormData(prev => ({ ...prev, heating: extractedData.costs!.heating.toString() }));
      }
      if (extractedData.costs?.water) {
        setFormData(prev => ({ ...prev, water: extractedData.costs!.water.toString() }));
      }
      if (extractedData.costs?.waste) {
        setFormData(prev => ({ ...prev, waste: extractedData.costs!.waste.toString() }));
      }
      if (extractedData.costs?.maintenance) {
        setFormData(prev => ({ ...prev, maintenance: extractedData.costs!.maintenance.toString() }));
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
      // Don't show error - just continue with manual input
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleScanAssist(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <Calculator className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {t.manualDataEntry}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {t.manualInputDescription}
        </p>
        
        {/* Scan Helper */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
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
            <div className="flex items-center space-x-3 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Scanning... {scanProgress}%</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <Camera className="h-4 w-4" />
                <span>📸 Scan to Pre-fill</span>
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Upload className="h-4 w-4" />
                <span>📄 Upload to Pre-fill</span>
              </button>
            </>
          )}
        </div>
        
        <p className="text-xs text-gray-500">
          💡 Optional: Scan your bill to automatically fill some fields, then review and submit
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>{t.addressInformation}</span>
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                German Postal Code (PLZ) *
              </label>
              <input
                type="text"
                value={formData.plz}
                onChange={(e) => updateField('plz', e.target.value.slice(0, 5))}
                placeholder="e.g., 10115"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.plz ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={5}
                pattern="[0-9]{5}"
              />
              {errors.plz && <p className="text-red-500 text-xs mt-1">{errors.plz}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apartment Size (m²) *
              </label>
              <input
                type="number"
                value={formData.apartmentSize}
                onChange={(e) => updateField('apartmentSize', e.target.value)}
                placeholder="e.g., 75"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.apartmentSize ? 'border-red-500' : 'border-gray-300'
                }`}
                min="10"
                max="500"
                step="0.1"
              />
              {errors.apartmentSize && <p className="text-red-500 text-xs mt-1">{errors.apartmentSize}</p>}
            </div>
          </div>
        </div>

        {/* Cost Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Euro className="h-5 w-5 text-green-600" />
            <span>{t.monthlyCosting}</span>
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔥 {t.heating}
              </label>
              <input
                type="number"
                value={formData.heating}
                onChange={(e) => updateField('heating', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💧 {t.water}
              </label>
              <input
                type="number"
                value={formData.water}
                onChange={(e) => updateField('water', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🗑️ {t.waste}
              </label>
              <input
                type="number"
                value={formData.waste}
                onChange={(e) => updateField('waste', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔧 {t.maintenance}
              </label>
              <input
                type="number"
                value={formData.maintenance}
                onChange={(e) => updateField('maintenance', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          {errors.costs && <p className="text-red-500 text-sm">{errors.costs}</p>}
        </div>

        {/* Period Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Home className="h-5 w-5 text-purple-600" />
            <span>{t.billingPeriod}</span>
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.startDate}
              </label>
              <input
                type="date"
                value={formData.period.start}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  period: { ...prev.period, start: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.endDate}
              </label>
              <input
                type="date"
                value={formData.period.end}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  period: { ...prev.period, end: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg touch-target flex items-center justify-center space-x-3"
          >
            <Calculator className="h-6 w-6" />
            <span>{t.analyzeCosts}</span>
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-3">{t.tipsTitle}</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>{t.tip1}</li>
            <li>{t.tip2}</li>
            <li>{t.tip3}</li>
            <li>{t.tip4}</li>
          </ul>
        </div>

        {/* Scan Info */}
        <div className="bg-green-50 rounded-lg p-4">
          <h5 className="font-medium text-green-900 mb-3">📸 Smart Scan Assistant</h5>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Take a photo or upload your bill</li>
            <li>• AI will try to detect PLZ and costs</li>
            <li>• Review and correct any fields</li>
            <li>• Submit for accurate analysis</li>
          </ul>
          <p className="text-xs text-green-700 mt-2">
            💡 Scan is optional - you can always enter data manually for 100% accuracy
          </p>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">🏛️ Official Data Sources</h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
          <span>✅ SMARD (Bundesnetzagentur)</span>
          <span>✅ Corrently API</span>
          <span>✅ Fraunhofer Institute</span>
          <span>✅ Mieterbund Statistics</span>
        </div>
      </div>
    </div>
  );
}