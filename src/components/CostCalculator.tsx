'use client';

import { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

interface CostCalculatorProps {
  apartmentSize: number;
  onCalculatedCost: (category: string, costPerM2: number) => void;
}

export default function CostCalculator({ apartmentSize, onCalculatedCost }: CostCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [totalCost, setTotalCost] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState('heating');

  const calculate = () => {
    const total = parseFloat(totalCost);
    if (!total || !apartmentSize) return;

    const monthlyCost = period === 'yearly' ? total / 12 : total;
    const costPerM2 = monthlyCost / apartmentSize;
    
    onCalculatedCost(category, costPerM2);
    setTotalCost('');
    setIsOpen(false);
  };

  const calculatedResult = totalCost && apartmentSize ? 
    (period === 'yearly' ? parseFloat(totalCost) / 12 : parseFloat(totalCost)) / apartmentSize : 0;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        <Calculator className="h-4 w-4" />
        <span>Need help calculating?</span>
      </button>
    );
  }

  return (
    <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-900 flex items-center space-x-2">
          <Calculator className="h-4 w-4 text-blue-600" />
          <span>Cost Calculator</span>
        </h5>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Category Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cost Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="heating">🔥 Heating</option>
            <option value="water">💧 Water</option>
            <option value="waste">🗑️ Waste</option>
            <option value="maintenance">🔧 Maintenance</option>
          </select>
        </div>

        {/* Total Cost Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Total Cost (€)
          </label>
          <input
            type="number"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="e.g., 150"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
        </div>

        {/* Period Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Period
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                period === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriod('yearly')}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                period === 'yearly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Calculation Display */}
        {totalCost && apartmentSize && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">Calculation:</div>
              <div className="text-xs space-y-1">
                <div>€{totalCost} {period} ÷ {apartmentSize}m²{period === 'yearly' ? ' ÷ 12 months' : ''}</div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-bold">€{calculatedResult.toFixed(2)}/m²/month</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Apply Button */}
        <button
          type="button"
          onClick={calculate}
          disabled={!totalCost || !apartmentSize}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Apply to {category} field
        </button>
      </div>
    </div>
  );
}