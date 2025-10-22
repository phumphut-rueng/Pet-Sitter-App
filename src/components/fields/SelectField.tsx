import * as React from "react";
import { SelectOption } from "@/types/pet.types";
import { PET_FORM_STYLES } from "../features/pet/pet-form.config";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/utils";
import { CheckIcon } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";

type SelectFieldProps = {
  name: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className={PET_FORM_STYLES.label}>{children}</label>
);

// Custom SelectContent
const CustomSelectContent: React.FC<{ children: React.ReactNode; position?: "popper" | "item-aligned" }> = ({ 
  children, 
  position = "popper" 
}) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] origin-[var(--radix-select-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md shadow-md !border-0 bg-white",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
      )}
      position={position}
    >
      <SelectPrimitive.Viewport className="p-1 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

// Custom SelectItem
const CustomSelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ 
  value, 
  children 
}) => (
  <SelectPrimitive.Item
    value={value}
    className={cn(
      "focus:bg-gray-4 focus:text-white hover:bg-gray-4 hover:text-white relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    )}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  value,
  options,
  onChange,
}) => {
  const validOptions = options.filter(opt => opt.value && opt.value.trim());

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <Select
        value={value || ""}
        onValueChange={(val) => {
          onChange({
            target: { name, value: val },
          } as React.ChangeEvent<HTMLSelectElement>);
        }}
      >
        <SelectTrigger className="!h-11 w-full rounded-lg border border-gray-2 bg-white !px-4 text-sm2-regular text-black focus:outline-none focus:border-orange-5">
          <SelectValue placeholder="เลือก..." />
        </SelectTrigger>
        <CustomSelectContent>
          {validOptions.map((option) => (
            <CustomSelectItem key={option.value} value={option.value}>
              {option.label}
            </CustomSelectItem>
          ))}
        </CustomSelectContent>
      </Select>
    </div>
  );
};