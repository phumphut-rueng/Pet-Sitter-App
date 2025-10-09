import * as React from "react";
import { PetFieldConfig } from "@/types/pet.types";
import { PET_FORM_STYLES } from "../features/pet/pet-form.config";

type TextInputFieldProps = {
  config: PetFieldConfig;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pattern?: string;
  autoComplete?: string;
};

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className={PET_FORM_STYLES.label}>{children}</label>
);

export const TextInputField: React.FC<TextInputFieldProps> = ({
  config,
  value,
  onChange,
  pattern,
  autoComplete,
}) => (
  <div>
    <FormLabel>{config.label}</FormLabel>
    <input
      name={config.name}
      value={value}
      onChange={onChange}
      placeholder={config.placeholder}
      inputMode={config.inputMode}
      autoComplete={autoComplete}
      pattern={pattern}
      className={PET_FORM_STYLES.input.base}
    />
  </div>
);