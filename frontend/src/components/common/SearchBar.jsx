import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search products...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      }
      setQuery('');
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative ${className}`}
    >
      <div className={`relative flex items-center border rounded-lg transition-all duration-200 ${
        isFocused ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300 hover:border-gray-400'
      }`}>
        {/* Search Icon */}
        <div className="absolute left-3 text-gray-400">
          <Search size={20} />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 bg-green-500 text-white p-1 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Search size={16} />
        </button>
      </div>

      {/* Quick Suggestions */}
      {isFocused && query && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
          <div className="p-2">
            <p className="text-xs text-gray-500 px-2 py-1">
              Press Enter to search for "{query}"
            </p>
          </div>
        </div>
      )}
    </form>
  );
};

// Advanced Search Component for Product Page
export const AdvancedSearch = ({ onSearch, categories = [] }) => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleReset = () => {
    setSearchParams({
      query: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    });
    onSearch({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="font-semibold mb-4">Advanced Search</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Query */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Products
          </label>
          <input
            type="text"
            value={searchParams.query}
            onChange={(e) => handleChange('query', e.target.value)}
            placeholder="Enter product name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={searchParams.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.CategoryId} value={category.CategoryName}>
                {category.CategoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
            <input
              type="number"
              value={searchParams.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <input
              type="number"
              value={searchParams.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              placeholder="100"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;