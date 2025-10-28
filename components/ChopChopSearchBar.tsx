import React, { useState } from 'react';

interface ChopChopSearchBarProps {
  onSearch: (term: string) => void;
  loading?: boolean;
  placeholder?: string;
}

const ChopChopSearchBar: React.FC<ChopChopSearchBarProps> = ({ 
  onSearch, 
  loading = false,
  placeholder = "Search restaurants, cuisines..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 pl-14 pr-12 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm transition-all"
          disabled={loading}
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Loading/Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          ) : searchTerm ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Popular searches */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        <span className="text-sm text-gray-500 mr-2">Popular:</span>
        {['Nigerian', 'Fast Food', 'Chinese', 'Pizza', 'Shawarma'].map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => {
              setSearchTerm(term);
              onSearch(term);
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </form>
  );
};

export default ChopChopSearchBar;