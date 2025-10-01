import React from 'react';
import SearchFilter from '@/components/findpetsitter/SearchFilter';
import { useSearchFilter, type SearchFilters } from '@/hooks/useSearchFilter';

// ตัวอย่างการใช้งานในหน้าต่างๆ
export function PetSitterSearchPage() {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Searching with filters:', filters);
    // API call logic here
  };

  const handleClear = () => {
    console.log('Cleared filters');
    // Reset logic here
  };

  return (
    <div className="flex gap-8">
      <SearchFilter onSearch={handleSearch} onClear={handleClear} />
      <div className="flex-1">
        {/* Search results */}
      </div>
    </div>
  );
}

// ตัวอย่างการใช้งาน custom hook โดยตรง
export function CustomSearchPage() {
  const {
    searchTerm,
    selectedPetTypes,
    rating,
    selectedExperience,
    setSearchTerm,
    setSelectedExperience,
    handleSearch,
    handleClear,
    handlePetTypeChange,
    handleRatingChange,
  } = useSearchFilter({
    onSearch: (filters) => {
      console.log('Custom search:', filters);
    },
    onClear: () => {
      console.log('Custom clear');
    },
  });

  return (
    <div className="p-4">
      <h2>Custom Search Implementation</h2>
      
      {/* Custom UI implementation */}
      <div className="space-y-4">
        <div>
          <label>Search Term:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        
        <div>
          <label>Pet Types:</label>
          {['Dog', 'Cat', 'Bird', 'Rabbit'].map((petType) => (
            <label key={petType} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPetTypes.includes(petType)}
                onChange={(e) => handlePetTypeChange(petType, e.target.checked)}
              />
              {petType}
            </label>
          ))}
        </div>
        
        <div>
          <label>Rating: {rating}</label>
          <input
            type="range"
            min="0"
            max="5"
            value={rating}
            onChange={(e) => handleRatingChange(Number(e.target.value))}
          />
        </div>
        
        <div>
          <label>Experience:</label>
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All Experience</option>
            <option value="0-2">0-2 Years</option>
            <option value="3-5">3-5 Years</option>
            <option value="5+">5+ Years</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
            Search
          </button>
          <button onClick={handleClear} className="bg-gray-500 text-white px-4 py-2 rounded">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// ตัวอย่างการใช้งานกับ initial filters
export function PreFilteredSearchPage() {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Pre-filtered search:', filters);
  };

  const handleClear = () => {
    console.log('Pre-filtered clear');
  };

  return (
    <div className="flex gap-8">
      <SearchFilter
        onSearch={handleSearch}
        onClear={handleClear}
        initialFilters={{
          petTypes: ['Dog', 'Cat'],
          rating: 4,
          experience: '3-5',
        }}
      />
      <div className="flex-1">
        {/* Search results */}
      </div>
    </div>
  );
}
