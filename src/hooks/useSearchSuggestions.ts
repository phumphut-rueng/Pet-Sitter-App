import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface UseSearchSuggestionsProps {
  searchTerm: string;
  debounceMs?: number;
}

export const useSearchSuggestions = ({ 
  searchTerm, 
  debounceMs = 300 
}: UseSearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/sitter/search-suggestions', {
        params: { q: term }
      });
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchSuggestions, debounceMs]);

  const selectSuggestion = useCallback((suggestion: string) => {
    setShowSuggestions(false);
    return suggestion;
  }, []);

  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  return {
    suggestions,
    loading,
    showSuggestions,
    selectSuggestion,
    hideSuggestions,
  };
};
