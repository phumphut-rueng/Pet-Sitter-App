import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = '', 
  label,
  size = 'md' 
}: SearchInputProps) {
  const { suggestions, loading, showSuggestions, selectSuggestion, hideSuggestions } = useSearchSuggestions({
    searchTerm: value,
  });

  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    selectSuggestion(suggestion);
    searchRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      hideSuggestions();
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        hideSuggestions();
      }
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        hideSuggestions();
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hideSuggestions]);

  const sizeClasses = {
    sm: 'h-10 px-3 py-2 text-sm',
    md: 'h-12 px-4 py-3 text-sm',
    lg: 'h-14 px-5 py-4 text-base'
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-semibold text-gray-7 mb-2 block">
          {label}
        </label>
      )}
      <div className="relative" ref={suggestionsRef}>
        <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-4 ${
          size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
        }`} />
        {value && (
          <button
            onClick={() => onChange('')}
            className={`absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-4 hover:text-gray-6 ${
              size === 'sm' ? 'h-4 w-4' : 'h-4 w-4'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <input
          ref={searchRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={`w-full bg-white border border-gray-2 rounded-lg placeholder:text-gray-6 focus:outline-none focus:border-orange-5 focus:ring-2 focus:ring-orange-5 focus:ring-offset-bg ${sizeClasses[size]}`}
        />
        
        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && isFocused && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-2 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left text-gray-7 hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                  size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm'
                }`}
              >
                <Search className={`text-gray-4 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
