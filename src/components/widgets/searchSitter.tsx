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
    <div className="flex flex-col items-center gap-4 bg-gray-1 mt-5 ">
      <PetTypeCheckBox layout="row" />
      <div className="flex flex-row items-center gap-2 bg-white">
        <p className="text-sm font-bold">Rating:</p>
        <RatingSelect value={5} selectRating={rating} onChange={handleChange} />
        <RatingSelect value={4} selectRating={rating} onChange={handleChange} />
        <RatingSelect value={3} selectRating={rating} onChange={handleChange} />
        <RatingSelect value={2} selectRating={rating} onChange={handleChange} />
        <RatingSelect value={1} selectRating={rating} onChange={handleChange} />
        <Select>
          <SelectTrigger className="w-[180px] hover:cursor-pointer">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">0-2 Years</SelectItem>
            <SelectItem value="dark">3-5 Years</SelectItem>
            <SelectItem value="system">5+ Years</SelectItem>
          </SelectContent>
        </Select>

        <PrimaryButton text="Cash"  srcImage="/icons/cash.svg" className="h-20 border hover:border-orange-5"/>
      </div>
    </div>
  );
}
