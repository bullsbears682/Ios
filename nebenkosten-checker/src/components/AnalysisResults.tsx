'use client';

import { AnalysisResult } from '@/lib/bill-analyzer';
import { TrendingUp, TrendingDown, Minus, MapPin, Calendar, Home, Euro, Download, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

export default function AnalysisResults({ result, onNewAnalysis }: AnalysisResultsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low': return <TrendingDown className="h-5 w-5 text-green-500" />;
      case 'high': return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'very_high': return <TrendingUp className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very_high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Chart data
  const comparisonData = [
    {
      category: 'Heizung',
      'Ihre Kosten': result.userCosts.heating,
      'Durchschnitt': result.regionalAverages.heating,
    },
    {
      category: 'Wasser',
      'Ihre Kosten': result.userCosts.water,
      'Durchschnitt': result.regionalAverages.water,
    },
    {
      category: 'Müll',
      'Ihre Kosten': result.userCosts.waste,
      'Durchschnitt': result.regionalAverages.waste,
    },
    {
      category: 'Wartung',
      'Ihre Kosten': result.userCosts.maintenance,
      'Durchschnitt': result.regionalAverages.maintenance,
    },
  ];

  const pieData = [
    { name: 'Heizung', value: result.userCosts.heating, color: '#EF4444' },
    { name: 'Wasser', value: result.userCosts.water, color: '#3B82F6' },
    { name: 'Müll', value: result.userCosts.waste, color: '#10B981' },
    { name: 'Wartung', value: result.userCosts.maintenance, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analyse Ihrer Nebenkosten</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{result.cityInfo.city}, {result.cityInfo.state}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Daten vom {result.energyData.rates.timestamp.split('T')[0]}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Versorger: {result.cityInfo.utilityProvider}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Datenqualität</div>
            <div className="text-2xl font-bold text-green-600">{result.confidence}%</div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Gesamte Nebenkosten</div>
            <div className="text-2xl font-bold text-blue-900">
              €{result.userCosts.total.toFixed(2)}/m²
            </div>
            <div className="text-sm text-blue-700">
              vs. €{result.regionalAverages.total.toFixed(2)} Durchschnitt
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            result.savings.potential > 0 ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <div className={`text-sm font-medium ${
              result.savings.potential > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              Einsparpotenzial
            </div>
            <div className={`text-2xl font-bold ${
              result.savings.potential > 0 ? 'text-red-900' : 'text-green-900'
            }`}>
              €{result.savings.potential.toFixed(0)}/Jahr
            </div>
            <div className={`text-sm ${
              result.savings.potential > 0 ? 'text-red-700' : 'text-green-700'
            }`}>
              {result.savings.potential > 0 ? 'Mögliche Ersparnis' : 'Faire Kosten'}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">CO₂-Fußabdruck</div>
            <div className="text-2xl font-bold text-purple-900">
              {result.energyData.co2Footprint}g
            </div>
            <div className="text-sm text-purple-700">CO₂ pro kWh</div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Detaillierter Kostenvergleich</h3>
        
        {/* Cost Categories */}
        <div className="space-y-4 mb-8">
          {Object.entries(result.comparisons).map(([category, comparison]) => {
            if (category === 'total') return null;
            
            const categoryNames: Record<string, string> = {
              heating: 'Heizung & Warmwasser',
              water: 'Kaltwasser & Abwasser',
              waste: 'Müll & Entsorgung',
              maintenance: 'Instandhaltung & Wartung'
            };

            return (
              <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(comparison.status)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {categoryNames[category]}
                    </div>
                    <div className="text-sm text-gray-600">
                      €{result.userCosts[category as keyof typeof result.userCosts].toFixed(2)}/m² 
                      vs. €{result.regionalAverages[category as keyof typeof result.regionalAverages].toFixed(2)} Durchschnitt
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(comparison.status)}`}>
                  {comparison.message}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Kostenvergleich (€/m²/Monat)</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`€${value.toFixed(2)}`, '']}
                  labelFormatter={(label) => `${label}:`}
                />
                <Bar dataKey="Ihre Kosten" fill="#EF4444" />
                <Bar dataKey="Durchschnitt" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown Pie Chart */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Kostenverteilung</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: €${value.toFixed(2)}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `€${value.toFixed(2)}/m²`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Empfehlungen</h4>
            {result.savings.recommendations.length > 0 ? (
              <ul className="space-y-3">
                {result.savings.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Euro className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-green-700 bg-green-50 p-4 rounded-lg">
                <div className="font-medium">Glückwunsch! 🎉</div>
                <div className="text-sm mt-1">
                  Ihre Nebenkosten liegen im normalen Bereich. Keine Auffälligkeiten erkannt.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Energy Data */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Aktuelle Energiedaten für {result.cityInfo.city}</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Strompreis</div>
            <div className="text-xl font-bold text-yellow-900">
              €{result.energyData.rates.electricity.toFixed(3)}/kWh
            </div>
            <div className="text-sm text-yellow-700">inkl. Netzentgelte</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Gaspreis</div>
            <div className="text-xl font-bold text-orange-900">
              €{result.energyData.rates.gas.toFixed(3)}/kWh
            </div>
            <div className="text-sm text-orange-700">inkl. Netzentgelte</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">CO₂-Intensität</div>
            <div className="text-xl font-bold text-green-900">
              {result.energyData.co2Footprint}g
            </div>
            <div className="text-sm text-green-700">CO₂ pro kWh Strom</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Datenquelle: {result.energyData.rates.source} • 
          Letztes Update: {new Date(result.energyData.rates.timestamp).toLocaleString('de-DE')}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weitere Aktionen</h3>
            <p className="text-gray-600 text-sm">Exportieren Sie Ihre Analyse oder starten Sie eine neue Prüfung</p>
          </div>
          
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>PDF Report</span>
            </button>
            
            <button 
              onClick={onNewAnalysis}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Neue Analyse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt */}
      {result.savings.potential > 200 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">💰 Sparen Sie €{result.savings.potential.toFixed(0)} pro Jahr!</h3>
              <p className="text-blue-100">
                Holen Sie sich detaillierte Handlungsempfehlungen und Vorlagen für Vermieter-Gespräche
              </p>
            </div>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Premium upgraden
            </button>
          </div>
        </div>
      )}

      {/* Data Sources */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Datengrundlage</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900">Regionale Durchschnittskosten:</div>
            <div className="text-gray-600">{result.cityInfo.dataSource}</div>
            <div className="text-gray-500">Letztes Update: {result.cityInfo.lastUpdated}</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Aktuelle Energiepreise:</div>
            <div className="text-gray-600">{result.energyData.rates.source}</div>
            <div className="text-gray-500">
              Live-Daten von Bundesnetzagentur & Fraunhofer Institut
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Hinweis:</strong> Diese Analyse dient zur Information und ersetzt keine rechtliche Beratung. 
            Bei Unstimmigkeiten empfehlen wir das Gespräch mit Ihrem Vermieter oder eine Beratung beim Mieterbund.
          </div>
        </div>
      </div>
    </div>
  );
}