import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import RatingSelect from "../ratingStar";

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

interface SearchFilters {
  searchTerm: string;
  petTypes: string[];
  rating: number;
  experience: string;
}

export default function SearchFilter({ onSearch, onClear }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedExperience, setSelectedExperience] = useState<string>("0-2");

  const [rating, setRating] = useState(0);
  const handleChange = (newRating: number) => {
    console.log("คุณเลือก:", newRating);
    setRating(newRating);
  };

  const handleSearch = () => {
    onSearch({
      searchTerm,
      petTypes: selectedPetTypes,
      rating: selectedRating,
      experience: selectedExperience,
    });
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedPetTypes([]);
    setRating(0);
    setSelectedExperience("0-2");
    onClear();
  };

  return (
    <div className="w-90 bg-white rounded-xl shadow-md p-6 h-fit">
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
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPetTypes([...selectedPetTypes, petType]);
                  } else {
                    setSelectedPetTypes(
                      selectedPetTypes.filter((type) => type !== petType)
                    );
                  }
                }}
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
      <div className="flex flex-col gap-2 sm:gap-3">
        <label className="text-sm font-semibold text-gray-7 whitespace-nowrap">
          Rating:
        </label>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <RatingSelect
            value={5}
            selectRating={rating}
            onChange={handleChange}
            className="w-fit"
            classNameStar="w-4"
          />
          <RatingSelect
            value={4}
            selectRating={rating}
            onChange={handleChange}
            className="w-fit"
            classNameStar="w-4"
          />
          <RatingSelect
            value={3}
            selectRating={rating}
            onChange={handleChange}
            className="w-fit"
            classNameStar="w-4"
          />
          <RatingSelect
            value={2}
            selectRating={rating}
            onChange={handleChange}
            className="w-fit"
            classNameStar="w-4"
          />
          <RatingSelect
            value={1}
            selectRating={rating}
            onChange={handleChange}
            className="w-fit"
            classNameStar="w-4"
          />
        </div>
      </div>

      {/* Experience */}
      <div className="mb-5 mt-6">
        <label className="text-sm font-semibold text-gray-7 mb-3 block">
          Experience:
        </label>
        <Select
          value={selectedExperience}
          onValueChange={setSelectedExperience}
        >
          <SelectTrigger className="w-full hover:cursor-pointer bg-white border-gray-2 focus:border-orange-5 focus:ring-orange-5">
            <SelectValue placeholder="0-2 Years" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-2">
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
      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex-1 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg font-medium hover:bg-orange-200 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleSearch}
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}
