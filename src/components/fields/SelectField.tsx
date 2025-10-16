import * as React from "react";
import { SelectOption } from "@/types/pet.types";
import { PET_FORM_STYLES } from "../features/pet/pet-form.config";

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

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  value,
  options,
  onChange,
}) => (
  <div>
    <FormLabel>{label}</FormLabel>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`${PET_FORM_STYLES.input.base} cursor-pointer font-normal placeholder:font-normal`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);