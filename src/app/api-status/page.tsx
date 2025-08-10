'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, ExternalLink, Zap, Database, TrendingUp } from 'lucide-react';
import { energyService } from '@/lib/energy-apis';
import { lookupPLZ } from '@/lib/german-cities';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface APIStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  lastUpdate: string;
  responseTime: number;
  sampleData?: any;
}

export default function APIStatusPage() {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [testPLZ, setTestPLZ] = useState('10115');
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const officialAPIs = [
    {
      name: 'SMARD (Bundesnetzagentur)',
      url: 'https://www.smard.de/app/chart_data',
      description: 'Official German Federal Network Agency - Real-time electricity prices',
      official: true
    },
    {
      name: 'Corrently',
      url: 'https://api.corrently.io',
      description: 'Real-time CO₂ footprint and green energy data by postal code',
      official: true
    },
    {
      name: 'Energy Charts (Fraunhofer)',
      url: 'https://api.energy-charts.info',
      description: 'Fraunhofer Institute - Gas prices and energy mix data',
      official: true
    },
    {
      name: 'Zippopotam.us',
      url: 'https://api.zippopotam.us',
      description: 'Postal code to city/state lookup service',
      official: false
    }
  ];

  const checkAPIStatus = async (api: any): Promise<APIStatus> => {
    const startTime = Date.now();
    
    try {
      let testUrl = '';
      let sampleData = null;
      
      switch (api.name) {
        case 'SMARD (Bundesnetzagentur)':
          testUrl = `${api.url}/410/DE/410_DE/hour_${new Date().toISOString().split('T')[0]}_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'Corrently':
          testUrl = `${api.url}/core/gsi?zip=10115`;
          break;
        case 'Energy Charts (Fraunhofer)':
          testUrl = `${api.url}/price?country=de`;
          break;
        case 'Zippopotam.us':
          testUrl = `${api.url}/de/10115`;
          break;
      }
      
      const response = await fetch(testUrl);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        sampleData = await response.json();
        return {
          name: api.name,
          url: api.url,
          status: 'online',
          lastUpdate: new Date().toISOString(),
          responseTime,
          sampleData
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: api.name,
        url: api.url,
        status: 'offline',
        lastUpdate: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        sampleData: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  };

  const testLiveData = async () => {
    setLoading(true);
    try {
      // Test with a specific PLZ
      const cityData = await lookupPLZ(testPLZ);
      const energyData = await energyService.getRegionalEnergyData(testPLZ);
      
      setLiveData({
        city: cityData,
        energy: energyData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Live data test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAllAPIs = async () => {
      const statuses = await Promise.all(
        officialAPIs.map(api => checkAPIStatus(api))
      );
      setApiStatuses(statuses);
    };

    checkAllAPIs();
    testLiveData();

    // Refresh every 5 minutes
    const interval = setInterval(checkAllAPIs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [testPLZ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">API Status & Data Verification</h1>
                <p className="text-sm text-gray-600">Real-time data source monitoring</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🔍 Verify Our Real Data Sources
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All data is fetched live from official German government and research institutions. 
            Check the status and see sample data below.
          </p>
        </div>

        {/* Live Data Test */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🧪 Test Live Data Fetching
          </h3>
          <div className="flex items-center space-x-4 mb-4">
            <input
              type="text"
              value={testPLZ}
              onChange={(e) => setTestPLZ(e.target.value)}
              placeholder="Enter PLZ (e.g., 10115)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={5}
            />
            <button
              onClick={testLiveData}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Live Data'}
            </button>
          </div>

          {liveData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">
                ✅ Live Data Retrieved at {new Date(liveData.timestamp).toLocaleString()}
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>City Data:</strong>
                  <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
{JSON.stringify(liveData.city, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Energy Data:</strong>
                  <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
{JSON.stringify(liveData.energy, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API Status Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {apiStatuses.map((api, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {api.status === 'online' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : api.status === 'checking' ? (
                    <Clock className="h-6 w-6 text-yellow-600 animate-spin" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{api.name}</h3>
                    <p className="text-sm text-gray-600">
                      {officialAPIs.find(oa => oa.name === api.name)?.description}
                    </p>
                  </div>
                </div>
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${
                    api.status === 'online' ? 'text-green-600' : 
                    api.status === 'checking' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {api.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-semibold">{api.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Checked:</span>
                  <span className="font-semibold">
                    {new Date(api.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Official Source:</span>
                  <span className={`font-semibold ${
                    officialAPIs.find(oa => oa.name === api.name)?.official ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {officialAPIs.find(oa => oa.name === api.name)?.official ? '✅ Yes' : '🔗 Partner'}
                  </span>
                </div>
              </div>

              {api.sampleData && (
                <div className="mt-4">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                      View Sample Data
                    </summary>
                    <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
{JSON.stringify(api.sampleData, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data Sources Documentation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            📋 Official Data Sources & Verification
          </h3>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">🏛️ SMARD API (Bundesnetzagentur)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Official German Federal Network Agency providing real-time electricity market data.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>• Hourly electricity prices</span>
                <span>• Grid fees by region</span>
                <span>• Market transparency data</span>
              </div>
              <a 
                href="https://www.smard.de" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                <span>Verify at smard.de</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">🌱 Corrently API</h4>
              <p className="text-sm text-gray-600 mb-2">
                Real-time CO₂ footprint and green energy data by German postal code.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>• CO₂ intensity by PLZ</span>
                <span>• Green energy forecasts</span>
                <span>• Regional energy mix</span>
              </div>
              <a 
                href="https://corrently.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                <span>Verify at corrently.io</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900">🔬 Energy Charts (Fraunhofer ISE)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Fraunhofer Institute for Solar Energy Systems - Gas prices and energy statistics.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>• Current gas prices</span>
                <span>• Energy production data</span>
                <span>• Research-grade accuracy</span>
              </div>
              <a 
                href="https://energy-charts.info" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                <span>Verify at energy-charts.info</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-gray-900">🏠 Betriebskostenspiegel</h4>
              <p className="text-sm text-gray-600 mb-2">
                Official German Tenant Association utility cost statistics and regional averages.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>• Regional cost averages</span>
                <span>• Annual cost surveys</span>
                <span>• Tenant protection data</span>
              </div>
              <a 
                href="https://www.mieterbund.de" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                <span>Verify at mieterbund.de</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* How to Verify */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            🔍 How to Verify Data Yourself
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">1. Check Electricity Prices</h4>
              <p className="text-sm text-gray-600 mb-3">
                Visit SMARD.de and compare current hourly prices with our displayed rates.
              </p>
              <a 
                href="https://www.smard.de/home/marktdaten/78?marketDataAttributes=%7B%22resolution%22:%22hour%22,%22from%22:1735689600000,%22to%22:1735862399999,%22moduleIds%22:%5B1004066,1001226,1001225,1004067,1004068,1001228%5D,%22selectedCategory%22:null,%22activeChart%22:true,%22style%22:%22color%22,%22categoriesModuleOrder%22:%7B%7D%7D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <span>Check SMARD.de</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">2. Verify CO₂ Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                Check Corrently.io for real-time CO₂ footprint by entering your postal code.
              </p>
              <a 
                href="https://corrently.io/hintergrund/gsi/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <span>Check Corrently</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="text-center">
              <Database className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">3. Compare Averages</h4>
              <p className="text-sm text-gray-600 mb-3">
                Cross-reference our cost averages with official Mieterbund statistics.
              </p>
              <a 
                href="https://www.mieterbund.de/service/betriebskostenspiegel.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <span>Check Mieterbund</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              📡 Real-time API Status
            </h3>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="grid gap-4">
            {apiStatuses.map((api, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {api.status === 'online' ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{api.name}</div>
                    <div className="text-xs text-gray-500">{api.url}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    api.status === 'online' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {api.status === 'online' ? '🟢 LIVE' : '🔴 OFFLINE'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {api.responseTime}ms response
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Main */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span>← Back to NebenKosten-Checker</span>
          </a>
        </div>
      </div>
    </div>
  );
}