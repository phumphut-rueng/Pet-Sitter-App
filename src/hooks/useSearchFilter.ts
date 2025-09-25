import { useState, useCallback, useEffect } from 'react';

export interface SearchFilters {
  searchTerm: string;
  petTypes: string[];
  rating: number;
  experience: string;
}

export interface UseSearchFilterOptions {
  onSearch?: (filters: SearchFilters) => void;
  onClear?: () => void;
  initialFilters?: Partial<SearchFilters>;
}

export function useSearchFilter(options: UseSearchFilterOptions = {}) {
  const { onSearch, onClear, initialFilters } = options;

  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    petTypes: [],
    rating: 0,
    experience: 'all',
    ...initialFilters,
  });

  const [searchTerm, setSearchTerm] = useState(filters.searchTerm);
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>(filters.petTypes);
  const [rating, setRating] = useState(filters.rating);
  const [selectedExperience, setSelectedExperience] = useState(filters.experience);

  // Update individual state variables when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.searchTerm !== undefined) {
        setSearchTerm(initialFilters.searchTerm);
      }
      if (initialFilters.petTypes !== undefined) {
        setSelectedPetTypes(initialFilters.petTypes);
      }
      if (initialFilters.rating !== undefined) {
        setRating(initialFilters.rating);
      }
      if (initialFilters.experience !== undefined) {
        setSelectedExperience(initialFilters.experience);
      }
    }
  }, [initialFilters]);

  const handleSearch = useCallback(() => {
    const newFilters: SearchFilters = {
      searchTerm,
      petTypes: selectedPetTypes,
      rating,
      experience: selectedExperience,
    };
    
    setFilters(newFilters);
    onSearch?.(newFilters);
  }, [searchTerm, selectedPetTypes, rating, selectedExperience, onSearch]);

  const handleClear = useCallback(() => {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      petTypes: [],
      rating: 0,
      experience: 'all',
    };
    
    setSearchTerm('');
    setSelectedPetTypes([]);
    setRating(0);
    setSelectedExperience('all');
    setFilters(clearedFilters);
    onClear?.();
  }, [onClear]);

  const handlePetTypeChange = useCallback((petType: string, checked: boolean) => {
    if (checked) {
      setSelectedPetTypes(prev => [...prev, petType]);
    } else {
      setSelectedPetTypes(prev => prev.filter(type => type !== petType));
    }
  }, []);

  const handleRatingChange = useCallback((newRating: number) => {
    setRating(newRating);
  }, []);

  return {
    // State
    searchTerm,
    selectedPetTypes,
    rating,
    selectedExperience,
    filters,
    
    // Setters
    setSearchTerm,
    setSelectedPetTypes,
    setRating,
    setSelectedExperience,
    
    // Handlers
    handleSearch,
    handleClear,
    handlePetTypeChange,
    handleRatingChange,
  };
}
