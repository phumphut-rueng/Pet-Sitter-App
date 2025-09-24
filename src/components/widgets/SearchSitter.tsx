import { useState } from "react";
import PrimaryButton from "../buttons/primaryButton";
import RatingSelect from "../ratingStar";
import PetTypeCheckBox from "../petTypeCheckBox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function SearchSitter() {
  const [rating, setRating] = useState(0);
  const handleChange = (newRating: number) => {
    console.log("คุณเลือก:", newRating);
    setRating(newRating);
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
                onChange={(selected) => console.log("Selected pets:", selected)}
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
                <RatingSelect
                  value={5}
                  selectRating={rating}
                  onChange={handleChange}
                />
                <RatingSelect
                  value={4}
                  selectRating={rating}
                  onChange={handleChange}
                />
                <RatingSelect
                  value={3}
                  selectRating={rating}
                  onChange={handleChange}
                />
                <RatingSelect
                  value={2}
                  selectRating={rating}
                  onChange={handleChange}
                />
                <RatingSelect
                  value={1}
                  selectRating={rating}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Experience Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-sm font-semibold text-gray-7 whitespace-nowrap">
                Experience:
              </label>
                <Select>
                  <SelectTrigger className="w-full sm:w-[140px] hover:cursor-pointer bg-white border-gray-2 focus:border-orange-5 focus:ring-orange-5">
                    <SelectValue placeholder="0-2 Years" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2">
                    <SelectItem value="0-2" className="bg-white hover:bg-gray-1">0-2 Years</SelectItem>
                    <SelectItem value="3-5" className="bg-white hover:bg-gray-1">3-5 Years</SelectItem>
                    <SelectItem value="5+" className="bg-white hover:bg-gray-1">5+ Years</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            
            {/* Search Button */}
            <div className="flex justify-center lg:justify-end lg:ml-auto">
              <PrimaryButton 
                text="Search" 
                textColor="white" 
                bgColor="primary"
                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
