import React, { useState, useEffect } from 'react';
import { cityService, City } from '../services/city-service';

interface CityToggleProps {
  onCityChange?: (city: City) => void;
  showStats?: boolean;
  className?: string;
}

export const CityToggle: React.FC<CityToggleProps> = ({ 
  onCityChange, 
  showStats = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState<City>(cityService.getCurrentCity());
  const [cities] = useState<City[]>(cityService.getCities());
  const [cityStats, setCityStats] = useState<any>(null);

  useEffect(() => {
    // Load city stats
    const stats = cityService.getCityStats(currentCity.id);
    setCityStats(stats);
  }, [currentCity]);

  const handleCitySelect = (city: City) => {
    if (city.id === currentCity.id) return;
    
    setCurrentCity(city);
    cityService.setCurrentCity(city.id);
    setIsOpen(false);
    onCityChange?.(city);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 shadow-sm w-full md:w-auto"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            📍
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-800">{currentCity.name}</div>
            <div className="text-sm text-gray-500">{currentCity.state}</div>
          </div>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}>⌄</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full md:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Choose your city</h3>
            <p className="text-sm text-gray-600">Select a city to see available restaurants</p>
          </div>

          {/* City Options */}
          <div className="max-h-80 overflow-y-auto">
            {cities.map((city) => {
              const stats = cityService.getCityStats(city.id);
              const isSelected = city.id === currentCity.id;

              return (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full px-4 py-4 text-left hover:bg-orange-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                    isSelected ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${isSelected ? 'text-orange-700' : 'text-gray-800'}`}>
                          {city.name}
                        </h4>
                        {isSelected && (
                          <div className="px-2 py-1 bg-orange-200 text-orange-800 text-xs font-medium rounded-full">
                            Current
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{city.state}</p>
                      
                      {showStats && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <span>🏢</span>
                            <span>{stats.totalRestaurants} restaurants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>⭐</span>
                            <span>{stats.averageRating} avg rating</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🚚</span>
                            <span>₦{stats.deliveryFeeRange.min}-{stats.deliveryFeeRange.max}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isSelected && (
                      <div className="ml-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer with current city stats */}
          {showStats && cityStats && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-2">
                <strong>{currentCity.name}</strong> delivery coverage
              </div>
              <div className="flex flex-wrap gap-1">
                {currentCity.coverageAreas.slice(0, 4).map((area, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                  >
                    {area}
                  </span>
                ))}
                {currentCity.coverageAreas.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{currentCity.coverageAreas.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};