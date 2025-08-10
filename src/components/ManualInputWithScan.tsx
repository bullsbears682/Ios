'use client';

import { useState, useRef } from 'react';
import { MapPin, Home, Euro, Calculator, Camera, Upload, Scan, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BillData, billAnalyzer } from '@/lib/bill-analyzer';
import { OCRPreprocessor } from '@/lib/ocr-preprocessor';
import CostCalculator from './CostCalculator';
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
      newErrors.plz = 'Please enter a valid 5-digit German postal code (e.g., 10115)';
    }

    // Apartment size validation
    if (!formData.apartmentSize || parseFloat(formData.apartmentSize) < 10 || parseFloat(formData.apartmentSize) > 500) {
      newErrors.apartmentSize = 'Please enter apartment size between 10-500 m²';
    }

    // Cost validation with realistic ranges
    const heating = parseFloat(formData.heating || '0');
    const water = parseFloat(formData.water || '0');
    const waste = parseFloat(formData.waste || '0');
    const maintenance = parseFloat(formData.maintenance || '0');

    if (heating > 0 && (heating < 0.50 || heating > 5.00)) {
      newErrors.heating = 'Heating costs should be between €0.50-5.00/m²/month';
    }

    if (water > 0 && (water < 0.20 || water > 2.00)) {
      newErrors.water = 'Water costs should be between €0.20-2.00/m²/month';
    }

    if (waste > 0 && (waste < 0.10 || waste > 1.00)) {
      newErrors.waste = 'Waste costs should be between €0.10-1.00/m²/month';
    }

    if (maintenance > 0 && (maintenance < 0.30 || maintenance > 3.00)) {
      newErrors.maintenance = 'Maintenance costs should be between €0.30-3.00/m²/month';
    }

    const totalCosts = heating + water + waste + maintenance;

    if (totalCosts === 0) {
      newErrors.costs = 'Please enter at least one cost category';
    }

    if (totalCosts > 0 && totalCosts < 1.00) {
      newErrors.costs = 'Total monthly costs seem too low. Please check your entries.';
    }

    if (totalCosts > 12.00) {
      newErrors.costs = 'Total monthly costs seem very high. Please verify your entries.';
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
            <span>Monthly Costs per m² (€/m²/month)</span>
          </h4>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Enter monthly costs per square meter.</strong> For example, if your 75m² apartment costs €150/month for heating, enter: 150 ÷ 75 = <strong>2.00</strong>
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔥 Heating (€/m²/month)
              </label>
              <input
                type="number"
                value={formData.heating}
                onChange={(e) => updateField('heating', e.target.value)}
                placeholder="1.50 (typical: 0.50-5.00)"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.heating ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="5"
                step="0.01"
              />
              {errors.heating && <p className="text-red-500 text-xs mt-1">{errors.heating}</p>}
              <p className="text-xs text-gray-500 mt-1">Typical range: €0.50-5.00/m²/month</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💧 Water (€/m²/month)
              </label>
              <input
                type="number"
                value={formData.water}
                onChange={(e) => updateField('water', e.target.value)}
                placeholder="0.65 (typical: 0.20-2.00)"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.water ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="2"
                step="0.01"
              />
              {errors.water && <p className="text-red-500 text-xs mt-1">{errors.water}</p>}
              <p className="text-xs text-gray-500 mt-1">Typical range: €0.20-2.00/m²/month</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🗑️ Waste Management (€/m²/month)
              </label>
              <input
                type="number"
                value={formData.waste}
                onChange={(e) => updateField('waste', e.target.value)}
                placeholder="0.35 (typical: 0.10-1.00)"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.waste ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="1"
                step="0.01"
              />
              {errors.waste && <p className="text-red-500 text-xs mt-1">{errors.waste}</p>}
              <p className="text-xs text-gray-500 mt-1">Typical range: €0.10-1.00/m²/month</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔧 Maintenance (€/m²/month)
              </label>
              <input
                type="number"
                value={formData.maintenance}
                onChange={(e) => updateField('maintenance', e.target.value)}
                placeholder="1.20 (typical: 0.30-3.00)"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.maintenance ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="3"
                step="0.01"
              />
              {errors.maintenance && <p className="text-red-500 text-xs mt-1">{errors.maintenance}</p>}
              <p className="text-xs text-gray-500 mt-1">Typical range: €0.30-3.00/m²/month</p>
            </div>
          </div>
          
          {errors.costs && <p className="text-red-500 text-sm">{errors.costs}</p>}
          
          {/* Live Calculation Preview */}
          {formData.apartmentSize && parseFloat(formData.apartmentSize) > 0 && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">📊 Your Monthly Costs Preview</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🔥 Heating:</span>
                    <span className="font-medium">€{((parseFloat(formData.heating || '0') * parseFloat(formData.apartmentSize)).toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💧 Water:</span>
                    <span className="font-medium">€{((parseFloat(formData.water || '0') * parseFloat(formData.apartmentSize)).toFixed(2))}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🗑️ Waste:</span>
                    <span className="font-medium">€{((parseFloat(formData.waste || '0') * parseFloat(formData.apartmentSize)).toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔧 Maintenance:</span>
                    <span className="font-medium">€{((parseFloat(formData.maintenance || '0') * parseFloat(formData.apartmentSize)).toFixed(2))}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-300 mt-2 pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Monthly:</span>
                  <span className="text-blue-600">€{((parseFloat(formData.heating || '0') + parseFloat(formData.water || '0') + parseFloat(formData.waste || '0') + parseFloat(formData.maintenance || '0')) * parseFloat(formData.apartmentSize)).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Per m²: €{(parseFloat(formData.heating || '0') + parseFloat(formData.water || '0') + parseFloat(formData.waste || '0') + parseFloat(formData.maintenance || '0')).toFixed(2)}/m²/month
                </p>
              </div>
            </div>
          )}

          {/* Cost Calculator Helper */}
          {formData.apartmentSize && parseFloat(formData.apartmentSize) > 0 && (
            <div className="mt-4">
              <CostCalculator 
                apartmentSize={parseFloat(formData.apartmentSize)}
                onCalculatedCost={handleCalculatedCost}
              />
            </div>
          )}
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
          <h5 className="font-medium text-blue-900 mb-3">💡 How to Calculate €/m²/month</h5>
          <ul className="text-sm text-blue-800 space-y-2">
            <li><strong>Step 1:</strong> Find monthly cost from your bill (e.g., €150/month heating)</li>
            <li><strong>Step 2:</strong> Divide by apartment size (e.g., 150 ÷ 75m² = 2.00)</li>
            <li><strong>Step 3:</strong> Enter 2.00 in the heating field</li>
            <li><strong>Tip:</strong> If you only have yearly amounts, divide by 12 first</li>
          </ul>
          
          <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
            <p className="text-xs text-blue-900">
              <strong>Example:</strong> 75m² apartment, €180/month total → €2.40/m²/month
            </p>
          </div>
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