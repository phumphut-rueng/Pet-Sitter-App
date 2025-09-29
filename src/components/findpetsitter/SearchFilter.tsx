import { SearchInput } from "../search/SearchInput";
import { PetTypeFilter } from "../search/PetTypeFilter";
import { RatingFilter } from "../search/RatingFilter";
import { ExperienceFilter } from "../search/ExperienceFilter";
import { FilterActions } from "../search/FilterActions";
import { useSearchFilter, type SearchFilters } from "@/hooks/useSearchFilter";

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function SearchFilter({ onSearch, onClear, initialFilters }: SearchFilterProps) {
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
    onSearch,
    onClear,
    initialFilters,
  });

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-6 h-fit">
      {/* Mobile Layout - Horizontal */}
      <div className="block lg:hidden">
        <div className="space-y-4">
          {/* First Row - Search and Pet Type */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search for pet sitters..."
              size="sm"
              label="Search"
              className="flex-1"
            />
            <PetTypeFilter
              selectedPetTypes={selectedPetTypes}
              onPetTypeChange={handlePetTypeChange}
              layout="grid"
              label="Pet Type:"
              className="flex-1"
            />
          </div>

          {/* Second Row - Rating and Experience */}
          <div className="flex flex-col sm:flex-row gap-4">
            <RatingFilter
              rating={rating}
              onRatingChange={handleRatingChange}
              layout="horizontal"
              label="Rating:"
              className="flex-1"
            />
            <ExperienceFilter
              selectedExperience={selectedExperience}
              onExperienceChange={setSelectedExperience}
              size="sm"
              label="Experience:"
              className="flex-1"
            />
          </div>

          {/* Third Row - Action Buttons */}
          <FilterActions
            onSearch={handleSearch}
            onClear={handleClear}
            layout="horizontal"
            size="sm"
            className="justify-center sm:justify-end"
          />
        </div>
      </div>

      {/* Desktop Layout - Vertical */}
      <div className="hidden lg:block">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search"
          size="md"
          label="Search"
          className="mb-6"
        />
        
        <PetTypeFilter
          selectedPetTypes={selectedPetTypes}
          onPetTypeChange={handlePetTypeChange}
          layout="horizontal"
          label="Pet Type:"
          className="mb-6"
        />
        
        <RatingFilter
          rating={rating}
          onRatingChange={handleRatingChange}
          layout="horizontal"
          label="Rating:"
          className="mb-6"
        />
        
        <ExperienceFilter
          selectedExperience={selectedExperience}
          onExperienceChange={setSelectedExperience}
          size="md"
          label="Experience:"
          className="mb-6"
        />
        
        <FilterActions
          onSearch={handleSearch}
          onClear={handleClear}
          layout="vertical"
          size="md"
        />
      </div>
    </div>
  );
}
