import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PetTypeFilterProps {
  selectedPetTypes: string[];
  onPetTypeChange: (petType: string, checked: boolean) => void;
  className?: string;
  label?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export function PetTypeFilter({ 
  selectedPetTypes, 
  onPetTypeChange, 
  className = '', 
  label,
  layout = 'horizontal' 
}: PetTypeFilterProps) {
  const petTypes = ["Dog", "Cat", "Bird", "Rabbit"];

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-3',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 gap-2'
  };

  const handleCheckboxChange = (petType: string, checked: boolean) => {
    onPetTypeChange(petType, checked);
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-semibold text-gray-7 mb-2 block">
          {label}
        </label>
      )}
      <div className={layoutClasses[layout]}>
        {petTypes.map((petType) => (
          <div key={petType} className="flex items-center gap-2">
            <Checkbox
              id={petType}
              checked={selectedPetTypes.includes(petType)}
              onCheckedChange={(checked) => handleCheckboxChange(petType, checked as boolean)}
              className="border border-gray-2 hover:cursor-pointer hover:border-orange-5 focus:ring-orange-5 focus:ring-2 data-[state=checked]:bg-orange-5 data-[state=checked]:border-orange-5"
            />
            <Label
              htmlFor={petType}
              className={`hover:cursor-pointer text-sm font-medium whitespace-nowrap transition-colors ${
                selectedPetTypes.includes(petType) 
                  ? 'text-orange-5' 
                  : 'text-gray-7'
              }`}
            >
              {petType}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
