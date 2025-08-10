'use client';

import { useState } from 'react';
import { MapPin, Home, Euro, Calculator } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BillData } from '@/lib/bill-analyzer';

interface ManualDataInputProps {
  onDataSubmit: (data: BillData) => void;
  onCancel: () => void;
  initialData?: Partial<BillData>;
}

export default function ManualDataInput({ onDataSubmit, onCancel, initialData }: ManualDataInputProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    plz: initialData?.plz || '',
    apartmentSize: initialData?.apartmentSize?.toString() || '',
    heating: initialData?.costs?.heating?.toString() || '',
    water: initialData?.costs?.water?.toString() || '',
    waste: initialData?.costs?.waste?.toString() || '',
    maintenance: initialData?.costs?.maintenance?.toString() || '',
    period: {
      start: initialData?.period?.start || '2024-01-01',
      end: initialData?.period?.end || '2024-12-31'
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    onDataSubmit(billData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-6">
        <Calculator className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {t.manualDataEntry}
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          {t.manualInputDescription}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>{t.addressInformation}</span>
          </h4>
          
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

        {/* Cost Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Euro className="h-5 w-5 text-green-600" />
            <span>{t.monthlyCosting}</span>
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.heating}
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
                {t.water}
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
                {t.waste}
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
                {t.maintenance}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base touch-target"
          >
            {t.analyzeCosts}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base touch-target"
          >
            {t.cancel}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">{t.tipsTitle}</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>{t.tip1}</li>
          <li>{t.tip2}</li>
          <li>{t.tip3}</li>
          <li>{t.tip4}</li>
        </ul>
      </div>
    </div>
  );
}