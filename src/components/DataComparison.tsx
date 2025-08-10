'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { energyService } from '@/lib/energy-apis';

interface DataComparisonProps {
  plz: string;
}

export default function DataComparison({ plz }: DataComparisonProps) {
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Typical fake/static data that competitors use
  const fakeData = {
    electricityPrice: 0.30, // Static 2022 price
    gasPrice: 0.06,         // Static 2022 price
    co2Footprint: 400,      // Generic German average
    lastUpdated: '2022-12-31', // Old static data
    source: 'Static Database'
  };

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const data = await energyService.getRegionalEnergyData(plz);
        setRealData({
          electricityPrice: data.rates.electricity,
          gasPrice: data.rates.gas,
          co2Footprint: data.co2Footprint,
          lastUpdated: data.rates.timestamp,
          source: 'Live APIs'
        });
      } catch (error) {
        console.error('Failed to fetch real data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, [plz]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const calculateDifference = (real: number, fake: number) => {
    return ((real - fake) / fake * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        📊 Real Data vs. Competitors' Static Data
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Fake/Static Data */}
        <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-red-900">❌ Typical Competitor Data</h4>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Electricity:</span>
              <span className="font-mono">{fakeData.electricityPrice.toFixed(3)} €/kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Gas:</span>
              <span className="font-mono">{fakeData.gasPrice.toFixed(3)} €/kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">CO₂:</span>
              <span className="font-mono">{fakeData.co2Footprint}g/kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Last Updated:</span>
              <span className="text-red-600 font-semibold">{fakeData.lastUpdated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Source:</span>
              <span className="text-red-600 font-semibold">{fakeData.source}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-red-100 rounded border border-red-200">
            <p className="text-xs text-red-800">
              ⚠️ Static data from 2022 - not accurate for current market conditions
            </p>
          </div>
        </div>

        {/* Real/Live Data */}
        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">✅ Our Live Data (PLZ: {plz})</h4>
          </div>
          
          {realData && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Electricity:</span>
                <div className="text-right">
                  <span className="font-mono">{realData.electricityPrice.toFixed(3)} €/kWh</span>
                  <div className={`text-xs ${
                    parseFloat(calculateDifference(realData.electricityPrice, fakeData.electricityPrice)) > 0 
                      ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {parseFloat(calculateDifference(realData.electricityPrice, fakeData.electricityPrice)) > 0 ? '+' : ''}
                    {calculateDifference(realData.electricityPrice, fakeData.electricityPrice)}%
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Gas:</span>
                <div className="text-right">
                  <span className="font-mono">{realData.gasPrice.toFixed(3)} €/kWh</span>
                  <div className={`text-xs ${
                    parseFloat(calculateDifference(realData.gasPrice, fakeData.gasPrice)) > 0 
                      ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {parseFloat(calculateDifference(realData.gasPrice, fakeData.gasPrice)) > 0 ? '+' : ''}
                    {calculateDifference(realData.gasPrice, fakeData.gasPrice)}%
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">CO₂:</span>
                <div className="text-right">
                  <span className="font-mono">{realData.co2Footprint}g/kWh</span>
                  <div className={`text-xs ${
                    parseFloat(calculateDifference(realData.co2Footprint, fakeData.co2Footprint)) > 0 
                      ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {parseFloat(calculateDifference(realData.co2Footprint, fakeData.co2Footprint)) > 0 ? '+' : ''}
                    {calculateDifference(realData.co2Footprint, fakeData.co2Footprint)}%
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Last Updated:</span>
                <span className="text-green-600 font-semibold">
                  {new Date(realData.lastUpdated).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Source:</span>
                <span className="text-green-600 font-semibold">{realData.source}</span>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-green-100 rounded border border-green-200">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-700" />
              <p className="text-xs text-green-800">
                🔄 Updated every hour from official German sources
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Differences */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-3">🎯 Why Real Data Matters:</h5>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>✅ Real Data Benefits:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Reflects current market conditions</li>
              <li>• Accurate regional variations</li>
              <li>• Hourly price updates</li>
              <li>• Location-specific CO₂ data</li>
            </ul>
          </div>
          <div>
            <strong>❌ Static Data Problems:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Outdated pricing (2-3 years old)</li>
              <li>• Generic national averages</li>
              <li>• No regional specificity</li>
              <li>• Misleading cost comparisons</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}