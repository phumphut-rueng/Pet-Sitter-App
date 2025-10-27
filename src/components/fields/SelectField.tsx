import * as React from "react";
import { SelectOption } from "@/types/pet.types";
import { CustomSelect } from "@/components/dropdown/CustomSelect";


type SelectFieldProps = {
  name: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  value,
  options,
  onChange,
}) => {
  const validOptions = options.filter(opt => opt.value && opt.value.trim());

  return (
    <div className="[&_label]:!text-sm2-medium [&_button]:!mt-1 [&_button]:!h-11 [&_button]:!rounded-lg [&_button]:!border [&_button]:!border-gray-2 [&_button]:!px-4 [&_button]:!text-sm2-regular [&_button]:!text-black [&_button]:!font-normal [&_button:focus]:!outline-none [&_button:focus]:!border-orange-5 [&_button:focus]:!ring-0">
      <CustomSelect
        value={value || ""}
        onChange={(val) => {
          onChange({
            target: { name, value: val },
          } as React.ChangeEvent<HTMLSelectElement>);
        }}
        options={validOptions}
        placeholder="Select..."
        label={label}
        variant="default"
        triggerSize="w-full"
      />
    </div>
  );
};