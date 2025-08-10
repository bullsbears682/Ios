'use client';

import { useState, useEffect } from 'react';
import { MapPin, Zap, TrendingUp, Database } from 'lucide-react';
import { lookupPLZ } from '@/lib/german-cities';
import { energyService } from '@/lib/energy-apis';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function DemoPage() {
  const [selectedPLZ, setSelectedPLZ] = useState('10115');
  const [cityData, setCityData] = useState<any>(null);
  const [energyData, setEnergyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  // Demo PLZ codes for major German cities
  const demoCities = [
    { plz: '10115', name: 'Berlin Mitte' },
    { plz: '80331', name: 'München Zentrum' },
    { plz: '20095', name: 'Hamburg Zentrum' },
    { plz: '60311', name: 'Frankfurt Zentrum' },
    { plz: '50667', name: 'Köln Zentrum' },
    { plz: '70173', name: 'Stuttgart Zentrum' },
    { plz: '40213', name: 'Düsseldorf Zentrum' },
    { plz: '04109', name: 'Leipzig Zentrum' },
    { plz: '01067', name: 'Dresden Zentrum' },
    { plz: '30159', name: 'Hannover Zentrum' }
  ];

  const loadCityData = async (plz: string) => {
    setLoading(true);
    try {
      const [city, energy] = await Promise.all([
        lookupPLZ(plz),
        energyService.getRegionalEnergyData(plz)
      ]);
      setCityData(city);
      setEnergyData(energy);
    } catch (error) {
      console.error('Error loading city data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCityData(selectedPLZ);
  }, [selectedPLZ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">Demo</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t.demoTitle}
          </h2>
          <p className="text-xl text-gray-600">
            {t.demoSubtitle}
          </p>
        </div>

        {/* City Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.selectCity}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {demoCities.map((city) => (
              <button
                key={city.plz}
                onClick={() => setSelectedPLZ(city.plz)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedPLZ === city.plz
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city.name}
                <div className="text-xs opacity-75">{city.plz}</div>
              </button>
            ))}
          </div>
          
          {/* Custom PLZ Input */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Eigene PLZ eingeben (z.B. 12345)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={5}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  e.target.value = value;
                  if (value.length === 5) {
                    setSelectedPLZ(value);
                  }
                }}
              />
              <button
                onClick={() => loadCityData(selectedPLZ)}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Laden
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t.loadingData} {selectedPLZ}...</p>
          </div>
        ) : (
          <>
            {/* City Information */}
            {cityData && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {cityData.city}, {cityData.state}
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Postleitzahl</div>
                    <div className="text-2xl font-bold text-blue-900">{cityData.plz}</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Einwohner</div>
                    <div className="text-2xl font-bold text-green-900">
                      {cityData.population.toLocaleString('de-DE')}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Versorger</div>
                    <div className="text-lg font-bold text-purple-900">
                      {cityData.utilityProvider}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Datenquelle</div>
                    <div className="text-xs font-medium text-orange-900">
                      {cityData.dataSource.split(' + ')[0]}
                    </div>
                    <div className="text-xs text-orange-700">
                      Update: {cityData.lastUpdated}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Comparison */}
            {cityData && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Durchschnittskosten 2025 (€/m²/Monat)
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-sm text-red-600 font-medium">🔥 Heizung</div>
                    <div className="text-3xl font-bold text-red-900">
                      €{cityData.avgCosts.heating.toFixed(2)}
                    </div>
                    <div className="text-sm text-red-700">pro m² / Monat</div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium">💧 Wasser</div>
                    <div className="text-3xl font-bold text-blue-900">
                      €{cityData.avgCosts.water.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-700">pro m² / Monat</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600 font-medium">🗑️ {t.waste}</div>
                    <div className="text-3xl font-bold text-green-900">
                      €{cityData.avgCosts.waste.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700">pro m² / Monat</div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-600 font-medium">🔧 Wartung</div>
                    <div className="text-3xl font-bold text-yellow-900">
                      €{cityData.avgCosts.maintenance.toFixed(2)}
                    </div>
                    <div className="text-sm text-yellow-700">pro m² / Monat</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    Gesamte Nebenkosten: €{(
                      cityData.avgCosts.heating + 
                      cityData.avgCosts.water + 
                      cityData.avgCosts.waste + 
                      cityData.avgCosts.maintenance
                    ).toFixed(2)}/m²/Monat
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Für eine 60m² Wohnung: ~€{(
                      (cityData.avgCosts.heating + cityData.avgCosts.water + 
                       cityData.avgCosts.waste + cityData.avgCosts.maintenance) * 60
                    ).toFixed(0)}/Monat
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Energy Data */}
            {energyData && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Live Energiedaten
                  </h2>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    LIVE
                  </span>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">⚡ Strompreis</div>
                    <div className="text-2xl font-bold text-yellow-900">
                      €{energyData.rates.electricity.toFixed(3)}
                    </div>
                    <div className="text-sm text-yellow-700">pro kWh (inkl. Netzentgelte)</div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">🔥 Gaspreis</div>
                    <div className="text-2xl font-bold text-orange-900">
                      €{energyData.rates.gas.toFixed(3)}
                    </div>
                    <div className="text-sm text-orange-700">pro kWh (inkl. Netzentgelte)</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">{t.co2Intensity}</div>
                    <div className="text-2xl font-bold text-green-900">
                      {energyData.co2Footprint}g
                    </div>
                    <div className="text-sm text-green-700">CO₂ pro kWh Strom</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <strong>Datenquelle:</strong> {energyData.rates.source}
                    <br />
                    <strong>Letztes Update:</strong> {new Date(energyData.rates.timestamp).toLocaleString('de-DE')}
                  </div>
                </div>
              </div>
            )}

            {/* API Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  API-Status & Abdeckung
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Aktive APIs</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">SMARD (Bundesnetzagentur)</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">AKTIV</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Corrently CO₂ API</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">AKTIV</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Energy Charts (Fraunhofer)</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">AKTIV</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">PLZ Lookup Service</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">AKTIV</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Abdeckung</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Deutsche Postleitzahlen</span>
                      <span className="font-bold text-green-600">8.000+ ✓</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t.states}</span>
                      <span className="font-bold text-green-600">16/16 ✓</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t.citiesAndMunicipalities}</span>
                      <span className="font-bold text-green-600">11.000+ ✓</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Energieversorger</span>
                      <span className="font-bold text-green-600">900+ ✓</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                <div className="text-sm text-gray-800">
                  <strong>{t.completeGermanyCoverage}</strong> 
                  {t.demoCoverage}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Back to Main App */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span>{t.backToMain}</span>
          </a>
        </div>
      </div>
    </div>
  );
}