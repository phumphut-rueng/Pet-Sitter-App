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
            <input
              type="checkbox"
              id={petType}
              checked={selectedPetTypes.includes(petType)}
              onChange={(e) => onPetTypeChange(petType, e.target.checked)}
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
  );
}
