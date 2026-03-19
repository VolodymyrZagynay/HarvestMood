import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Specialized debounce hooks for common use cases
export const useDebouncedSearch = (initialValue = '', delay = 500) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm
  };
};

export const useDebouncedFilter = (filters, delay = 300) => {
  const [activeFilters, setActiveFilters] = useState(filters);
  const debouncedFilters = useDebounce(activeFilters, delay);

  const updateFilter = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setActiveFilters(filters);
  };

  return {
    activeFilters,
    debouncedFilters,
    updateFilter,
    resetFilters
  };
};