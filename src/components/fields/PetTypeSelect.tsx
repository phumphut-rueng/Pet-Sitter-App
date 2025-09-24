import * as React from "react";
import { X } from "lucide-react";

export type PetType = "Dog" | "Cat" | "Bird" | "Rabbit" ;

const options: PetType[] = ["Dog", "Cat", "Bird", "Rabbit"];

interface PetTypeSelectProps {
  value: PetType[] ;
  onChange: (value: PetType[]) => void;
  error?: boolean;
}

export default function PetTypeSelect({ value, onChange, error = false, }: PetTypeSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (pet: PetType) => {
    if (value.includes(pet)) {
      onChange(value.filter((v) => v !== pet));
    } else {
      onChange([...value, pet]);
    }
  };

  const removeOption = (pet: PetType) => {
    onChange(value.filter((v) => v !== pet));
  };

  return (
    <div className="relative">
      {/* Input area showing selected tags */}
      <div
        className={`w-full min-h-[48px] rounded-xl px-3 py-2 flex items-center flex-wrap gap-2 cursor-pointer
          border ${error ? "border-red" : "border-gray-2"}`}

        onClick={() => setOpen(!open)}
      >
        {value.length > 0 ? (
          value.map((pet) => (
            <span
              key={pet}
              className="flex items-center bg-orange-1 text-orange-6 px-2 py-1 rounded-lg text-sm"
            >
              {pet}
              <button
                type="button"
                className="ml-1 text-orange-6 hover:text-orange-4"
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening dropdown
                  removeOption(pet);
                }}
              >
                <X size={14} />
              </button>
            </span>
          ))
        ) : null}
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute mt-1 w-full bg-white border border-gray-2 rounded-xl shadow-md z-10">
          {options.map((pet) => (
            <div
              key={pet}
              className={`px-4 py-2 hover:bg-gray-1 ${
                value.includes(pet) ? "text-orange-6" : ""
              }`}
              onClick={() => toggleOption(pet)}
            >
              {pet}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

