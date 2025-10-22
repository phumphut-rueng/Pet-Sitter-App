import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomSelect } from "../dropdown/CustomSelect";
import { experienceSelect } from "@/lib/utils/data-select";

interface ExperienceFilterProps {
  selectedExperience: string;
  onExperienceChange: (experience: string) => void;
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}


export function ExperienceFilter({
  selectedExperience,
  onExperienceChange,
  className = '',
  label,
  size = 'md'
}: ExperienceFilterProps) {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-14'
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-semibold text-gray-7 mb-2 block">
          {label}
        </label>
      )}
      {/* nuk แก้ สร้าง component dropdown มาเพราะเห็นใช้หลายหน้า */}
      <CustomSelect
        value={selectedExperience}
        onChange={onExperienceChange}
        options={experienceSelect}
        variant="default"
        placeholder="All Experience"
      />

      {/* <Select
        value={selectedExperience}
        onValueChange={onExperienceChange}
      >
        <SelectTrigger className={`w-full hover:cursor-pointer bg-white border-gray-2 focus:border-orange-5 focus:ring-2 focus:ring-orange-5 ${sizeClasses[size]}`}>
          <SelectValue placeholder="All Experience" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-2 ">
          <SelectItem value="all" className="bg-white hover:bg-gray-1 cursor-pointer">
            All Experience
          </SelectItem>
          <SelectItem value="0-2" className="bg-white hover:bg-gray-1 cursor-pointer">
            0-2 Years
          </SelectItem>
          <SelectItem value="3-5" className="bg-white hover:bg-gray-1 cursor-pointer">
            3-5 Years
          </SelectItem>
          <SelectItem value="5+" className="bg-white hover:bg-gray-1 cursor-pointer">
            5+ Years
          </SelectItem>
        </SelectContent>
      </Select> */}
    </div>
  );
}
