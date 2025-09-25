import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import RatingSelect from "../ratingStar";
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
            {/* Search Input */}
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-7 mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-4 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search for pet sitters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 bg-white border border-gray-2 rounded-lg px-3 py-2 placeholder:text-gray-6 placeholder:text-sm focus:outline-none focus:border-orange-5 focus:ring-1 focus:ring-orange-5"
                />
              </div>
            </div>

            {/* Pet Type */}
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-7 mb-2 block">
                Pet Type:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Dog", "Cat", "Bird", "Rabbit"].map((petType) => (
                  <div key={petType} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={petType}
                      checked={selectedPetTypes.includes(petType)}
                      onChange={(e) => handlePetTypeChange(petType, e.target.checked)}
                      className="w-4 h-4 text-orange-5 border-gray-3 rounded focus:ring-orange-5 focus:ring-1"
                    />
                    <label
                      htmlFor={petType}
                      className="text-sm font-medium text-gray-7 cursor-pointer"
                    >
                      {petType}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second Row - Rating and Experience */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Rating */}
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-7 mb-2 block">
                Rating:
              </label>
              <div className="flex flex-wrap gap-2">
                <RatingSelect
                  value={5}
                  selectRating={rating}
                  onChange={handleRatingChange}
                  className="w-fit"
                  classNameStar="w-4"
                />
                <RatingSelect
                  value={4}
                  selectRating={rating}
                  onChange={handleRatingChange}
                  className="w-fit"
                  classNameStar="w-4"
                />
                <RatingSelect
                  value={3}
                  selectRating={rating}
                  onChange={handleRatingChange}
                  className="w-fit"
                  classNameStar="w-4"
                />
                <RatingSelect
                  value={2}
                  selectRating={rating}
                  onChange={handleRatingChange}
                  className="w-fit"
                  classNameStar="w-4"
                />
                <RatingSelect
                  value={1}
                  selectRating={rating}
                  onChange={handleRatingChange}
                  className="w-fit"
                  classNameStar="w-4"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-7 mb-2 block">
                Experience:
              </label>
              <Select
                value={selectedExperience}
                onValueChange={setSelectedExperience}
              >
                <SelectTrigger className="w-full hover:cursor-pointer bg-white border-gray-2 focus:border-orange-5 focus:ring-orange-5 h-10">
                  <SelectValue placeholder="All Experience" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-2">
                  <SelectItem value="all" className="bg-white hover:bg-gray-1">
                    All Experience
                  </SelectItem>
                  <SelectItem value="0-2" className="bg-white hover:bg-gray-1">
                    0-2 Years
                  </SelectItem>
                  <SelectItem value="3-5" className="bg-white hover:bg-gray-1">
                    3-5 Years
                  </SelectItem>
                  <SelectItem value="5+" className="bg-white hover:bg-gray-1">
                    5+ Years
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Third Row - Action Buttons */}
          <div className="flex justify-center sm:justify-end">
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-orange-100 text-orange-600 rounded-lg font-medium hover:bg-orange-200 transition-colors h-10"
              >
                Clear
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors h-10"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Vertical */}
      <div className="hidden lg:block">
        {/* Search Input */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-7 mb-3 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-4 h-5 w-5" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white border border-gray-2 rounded-lg px-4 py-3 placeholder:text-gray-6 placeholder:text-sm focus:outline-none focus:border-orange-5 focus:ring-1 focus:ring-orange-5"
            />
          </div>
        </div>

        {/* Pet Type */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-7 mb-3 block">
            Pet Type:
          </label>
          <div className="flex flex-wrap gap-3">
            {["Dog", "Cat", "Bird", "Rabbit"].map((petType) => (
              <div key={petType} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={petType}
                  checked={selectedPetTypes.includes(petType)}
                  onChange={(e) => handlePetTypeChange(petType, e.target.checked)}
                  className="w-4 h-4 text-orange-5 border-gray-3 rounded focus:ring-orange-5 focus:ring-2"
                />
                <label
                  htmlFor={petType}
                  className="text-sm font-medium text-gray-7 cursor-pointer"
                >
                  {petType}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-3 mb-6">
          <label className="text-sm font-semibold text-gray-7 whitespace-nowrap">
            Rating:
          </label>
          <div className="flex flex-wrap gap-2">
            <RatingSelect
              value={5}
              selectRating={rating}
              onChange={handleRatingChange}
              className="w-fit"
              classNameStar="w-4"
            />
            <RatingSelect
              value={4}
              selectRating={rating}
              onChange={handleRatingChange}
              className="w-fit"
              classNameStar="w-4"
            />
            <RatingSelect
              value={3}
              selectRating={rating}
              onChange={handleRatingChange}
              className="w-fit"
              classNameStar="w-4"
            />
            <RatingSelect
              value={2}
              selectRating={rating}
              onChange={handleRatingChange}
              className="w-fit"
              classNameStar="w-4"
            />
            <RatingSelect
              value={1}
              selectRating={rating}
              onChange={handleRatingChange}
              className="w-fit"
              classNameStar="w-4"
            />
          </div>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-7 mb-3 block">
            Experience:
          </label>
          <Select
            value={selectedExperience}
            onValueChange={setSelectedExperience}
          >
            <SelectTrigger className="w-full hover:cursor-pointer bg-white border-gray-2 focus:border-orange-5 focus:ring-orange-5 h-12">
              <SelectValue placeholder="Select Experience" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-2">
              <SelectItem value="all" className="bg-white hover:bg-gray-1">
                All Experience
              </SelectItem>
              <SelectItem value="0-2" className="bg-white hover:bg-gray-1">
                0-2 Years
              </SelectItem>
              <SelectItem value="3-5" className="bg-white hover:bg-gray-1">
                3-5 Years
              </SelectItem>
              <SelectItem value="5+" className="bg-white hover:bg-gray-1">
                5+ Years
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleClear}
            className="w-full px-4 py-2 bg-orange-100 text-orange-600 rounded-lg font-medium hover:bg-orange-200 transition-colors h-12"
          >
            Clear
          </button>
          <button
            onClick={handleSearch}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors h-12"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
