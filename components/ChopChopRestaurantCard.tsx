import React from 'react';
import { ChopChopRestaurant } from '../lib/services/chopchop-restaurants';

interface ChopChopRestaurantCardProps {
  restaurant: ChopChopRestaurant;
  onClick?: () => void;
  loading?: boolean;
  isSelected?: boolean;
}

const ChopChopRestaurantCard: React.FC<ChopChopRestaurantCardProps> = ({ 
  restaurant, 
  onClick, 
  loading = false, 
  isSelected = false 
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-orange-500 shadow-lg' : ''
      } ${loading ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      <div className="relative h-48">
        <img
          src={restaurant.bannerUrl || restaurant.logoUrl || '/placeholder-restaurant.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-restaurant.jpg';
          }}
        />
        
        {/* Open Status Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
            Open Now
          </span>
        </div>

        {/* Free Delivery Badge */}
        {restaurant.deliveryFee === 'Free' && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              🚚 Free Delivery
            </span>
          </div>
        )}

        {/* Restaurant Logo */}
        {restaurant.logoUrl && (
          <div className="absolute bottom-3 left-3 w-14 h-14 rounded-full overflow-hidden border-3 border-white shadow-lg bg-white">
            <img
              src={restaurant.logoUrl}
              alt={`${restaurant.name} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Restaurant Name & Cuisine */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              {restaurant.cuisineType} Cuisine
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">{restaurant.description}</p>
        
        {/* Rating & Reviews */}
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-3">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
            </svg>
            <span className="ml-1 text-sm font-semibold text-gray-900">{restaurant.rating}</span>
            <span className="ml-1 text-sm text-gray-500">(100+)</span>
          </div>
          <span className="text-sm text-gray-500">• {restaurant.deliveryTime}</span>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {restaurant.deliveryTime}
          </div>
          <div className="flex items-center">
            {restaurant.deliveryFee !== 'Free' && (
              <span className="text-sm text-gray-500 mr-3">{restaurant.deliveryFee} delivery</span>
            )}
            <span className="text-sm font-semibold text-orange-600 flex items-center">
              Order Now
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChopChopRestaurantCard;