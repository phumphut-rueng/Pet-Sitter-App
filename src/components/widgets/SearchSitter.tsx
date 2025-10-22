import PrimaryButton from "../buttons/PrimaryButton";
import RatingSelect from "../ratingStar";
import PetTypeCheckBox from "../petTypeCheckBox";
import { useSearchFilter, type SearchFilters } from "@/hooks/useSearchFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomSelect } from "../dropdown/CustomSelect";
import { experienceSelect } from "@/lib/utils/data-select";

export default function SearchSitter() {
  const {
    selectedPetTypes,
    rating,
    selectedExperience,
    handleSearch,
    handlePetTypeChange,
    handleRatingChange,
    setSelectedExperience,
  } = useSearchFilter({
    onSearch: (filters: SearchFilters) => {
      const queryParams = new URLSearchParams();

      if (filters.searchTerm) {
        queryParams.append('searchTerm', filters.searchTerm);
      }
      if (filters.petTypes.length > 0) {
        queryParams.append('petTypes', filters.petTypes.join(','));
      }
      if (filters.rating > 0) {
        queryParams.append('rating', filters.rating.toString());
      }
      if (filters.experience !== 'all') {
        queryParams.append('experience', filters.experience);
      }

      const queryString = queryParams.toString();
      const targetUrl = `/findpetsitter${queryString ? `?${queryString}` : ''}`;
      console.log('SearchSitter: Navigating to:', targetUrl);

      sessionStorage.setItem('searchFilters', JSON.stringify(filters));

      window.location.href = targetUrl;
    }
  });

  // ✅ wrapper ให้ type-safe กับ RatingSelect
  const handleRatingChangeWrapper = (value: string | number) => {
    const numberValue = typeof value === 'number' ? value : parseInt(value, 10);
    handleRatingChange(numberValue);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-0 mb-10">
      <div className="bg-white rounded-xl shadow-md border-1 border-gray-2 overflow-hidden">
        {/* Pet Type Section */}
        <div className="bg-gray-1 px-5 sm:px-10 py-4 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center gap-3 sm:gap-4">
            <label className="text-sm font-semibold text-gray-7">
              Pet Type:
            </label>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <PetTypeCheckBox
                layout="row"
                onChange={(selected) => {
                  selectedPetTypes.forEach(petType => {
                    if (!selected.includes(petType)) {
                      handlePetTypeChange(petType, false);
                    }
                  });
                  selected.forEach(petType => {
                    if (!selectedPetTypes.includes(petType)) {
                      handlePetTypeChange(petType, true);
                    }
                  });
                }}
              />
            </div>
          </div>
        </div>

        {/* Rating, Experience, and Search Section */}
        <div className="px-5 sm:px-10 py-4 sm:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            {/* Rating Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-sm font-semibold text-gray-7 whitespace-nowrap">
                Rating:
              </label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {[5, 4, 3, 2, 1].map((value) => (
                  <RatingSelect
                    key={value}
                    value={value}
                    selectRating={rating}
                    onChange={handleRatingChangeWrapper} // ใช้ wrapper
                  />
                ))}
              </div>
            </div>

            {/* Experience Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-sm font-semibold text-gray-7 whitespace-nowrap">
                Experience:
              </label>
              {/* nuk แก้ สร้าง component dropdown มาเพราะเห็นใช้หลายหน้า */}
              <CustomSelect
                value={selectedExperience}
                onChange={setSelectedExperience}
                options={experienceSelect}
                variant="default"
                placeholder="All Experience"
              />
              {/* <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger className="w-full sm:w-[180px] hover:cursor-pointer bg-white border-gray-2 focus:border-orange-5 focus:ring-orange-5">
                  <SelectValue placeholder="All Experience" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-2">
                  <SelectItem value="all" className="bg-white hover:bg-gray-1">All Experience</SelectItem>
                  <SelectItem value="0-2" className="bg-white hover:bg-gray-1">0-2 Years</SelectItem>
                  <SelectItem value="3-5" className="bg-white hover:bg-gray-1">3-5 Years</SelectItem>
                  <SelectItem value="5+" className="bg-white hover:bg-gray-1">5+ Years</SelectItem>
                </SelectContent>
              </Select> */}
            </div>

            {/* Search Button */}
            <div className="flex justify-center lg:justify-end lg:ml-auto">
              <PrimaryButton
                text="Search"
                textColor="white"
                bgColor="primary"
                onClick={handleSearch}
                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
