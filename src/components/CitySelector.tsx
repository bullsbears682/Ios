'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface City {
  plz: string;
  name: string;
}

interface CitySelectorProps {
  cities: City[];
  selectedPLZ: string;
  onSelectPLZ: (plz: string) => void;
}

export default function CitySelector({ cities, selectedPLZ, onSelectPLZ }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customPLZ, setCustomPLZ] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const selectedCity = cities.find(city => city.plz === selectedPLZ);

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.plz.includes(searchTerm)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleCitySelect = (plz: string) => {
    onSelectPLZ(plz);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomPLZSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPLZ.length === 5 && /^\d+$/.test(customPLZ)) {
      onSelectPLZ(customPLZ);
      setCustomPLZ('');
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* City Selector */}
      <div className="relative" ref={dropdownRef}>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{t.selectCity}</h2>
        
        {/* Selected City Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {selectedCity ? selectedCity.name : 'Select City'}
              </div>
              <div className="text-sm text-gray-500">PLZ: {selectedPLZ}</div>
            </div>
          </div>
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`
            z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden
            ${/* Mobile: Full screen modal */ ''}
            fixed md:absolute
            inset-0 md:inset-auto
            md:top-full md:left-0 md:right-0
            md:max-h-96
          `}>
            {/* Mobile Header */}
            <div className="md:hidden bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t.selectCity}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search city or PLZ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Custom PLZ Input */}
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-blue-50">
              <form onSubmit={handleCustomPLZSubmit} className="flex space-x-2">
                <input
                  type="text"
                  placeholder={t.enterPLZ}
                  value={customPLZ}
                  onChange={(e) => setCustomPLZ(e.target.value.slice(0, 5))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  pattern="[0-9]{5}"
                />
                <button
                  type="submit"
                  disabled={customPLZ.length !== 5}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Cities List */}
            <div className="max-h-60 md:max-h-48 overflow-y-auto">
              {filteredCities.map((city) => (
                <button
                  key={city.plz}
                  onClick={() => handleCitySelect(city.plz)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150
                    flex items-center space-x-3 focus:outline-none focus:bg-blue-50
                    ${selectedPLZ === city.plz ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700'}
                  `}
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium">{city.name}</div>
                    <div className="text-xs text-gray-500">PLZ: {city.plz}</div>
                  </div>
                  {selectedPLZ === city.plz && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              ))}
              
              {filteredCities.length === 0 && searchTerm && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No cities found for "{searchTerm}"</p>
                  <p className="text-xs text-gray-400 mt-1">Try entering a 5-digit PLZ above</p>
                </div>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="md:hidden border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 text-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}