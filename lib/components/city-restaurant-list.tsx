import React, { useState, useEffect } from 'react';
import { cityService, CityRestaurant, City } from '../services/city-service';

interface RestaurantCardProps {
  restaurant: CityRestaurant;
  onSelect?: (restaurant: CityRestaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSelect }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer border border-gray-100"
      onClick={() => onSelect?.(restaurant)}
    >
      {/* Restaurant Image */}
      <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 relative overflow-hidden">
        {restaurant.imageUrl ? (
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
        
        {/* Featured Badge */}
        {restaurant.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
            Featured
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-white bg-opacity-90 rounded-full flex items-center gap-1">
          <span className="text-yellow-500">⭐</span>
          <span className="text-sm font-medium">{restaurant.rating}</span>
        </div>

        {/* Open/Closed Status */}
        <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
          restaurant.isOpen 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {restaurant.isOpen ? 'Open' : 'Closed'}
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-800 text-lg mb-1">{restaurant.name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{restaurant.description}</p>
        </div>

        {/* Cuisine Types */}
        <div className="flex flex-wrap gap-1 mb-3">
          {restaurant.cuisineType.slice(0, 3).map((cuisine, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {cuisine}
            </span>
          ))}
          {restaurant.cuisineType.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{restaurant.cuisineType.length - 3}
            </span>
          )}
        </div>

        {/* Delivery Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-600">
              <span>🕒</span>
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <span>🚚</span>
              <span>₦{restaurant.deliveryFee}</span>
            </div>
          </div>
          <div className="text-gray-500">
            Min: ₦{restaurant.minimumOrder.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CityRestaurantListProps {
  city: City;
  searchQuery?: string;
  showFeaturedOnly?: boolean;
  onRestaurantSelect?: (restaurant: CityRestaurant) => void;
  className?: string;
}

export const CityRestaurantList: React.FC<CityRestaurantListProps> = ({
  city,
  searchQuery = '',
  showFeaturedOnly = false,
  onRestaurantSelect,
  className = ''
}) => {
  const [restaurants, setRestaurants] = useState<CityRestaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<CityRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load restaurants for the selected city
    setLoading(true);
    const cityRestaurants = showFeaturedOnly 
      ? cityService.getFeaturedRestaurants(city.id)
      : cityService.getRestaurantsByCity(city.id);
    
    setRestaurants(cityRestaurants);
    setLoading(false);
  }, [city.id, showFeaturedOnly]);

  useEffect(() => {
    // Filter restaurants based on search query
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = cityService.searchRestaurants(city.id, searchQuery);
      setFilteredRestaurants(showFeaturedOnly ? filtered.filter(r => r.featured) : filtered);
    }
  }, [searchQuery, restaurants, city.id, showFeaturedOnly]);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredRestaurants.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {searchQuery ? 'No restaurants found' : 'No restaurants available'}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {searchQuery 
            ? `We couldn't find any restaurants in ${city.name} matching "${searchQuery}". Try a different search term.`
            : `There are currently no ${showFeaturedOnly ? 'featured ' : ''}restaurants available in ${city.name}.`
          }
        </p>
        {searchQuery && (
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Show all restaurants
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {showFeaturedOnly ? 'Featured' : 'All'} Restaurants in {city.name}
          </h2>
          <p className="text-gray-600">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
        
        {!showFeaturedOnly && restaurants.length > 0 && (
          <div className="text-sm text-gray-500">
            {restaurants.filter(r => r.featured).length} featured
          </div>
        )}
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onSelect={onRestaurantSelect}
          />
        ))}
      </div>

      {/* City Coverage Info */}
      <div className="mt-12 p-6 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-800 mb-3">
          Delivery Coverage in {city.name}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {city.coverageAreas.map((area, index) => (
            <div 
              key={index}
              className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 text-center border border-gray-200"
            >
              {area}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-3">
          We deliver within {city.deliveryRadius}km of {city.name} city center. 
          Delivery fees may vary by location.
        </p>
      </div>
    </div>
  );
};