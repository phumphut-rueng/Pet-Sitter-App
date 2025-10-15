import * as React from "react";
import { PET_FORM_STYLES } from "../features/pet/pet-form.config";

type TextAreaFieldProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className={PET_FORM_STYLES.label}>{children}</label>
);

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ value, onChange }) => (
  <div>
    <FormLabel>About</FormLabel>
    <textarea
      name="about"
      value={value}
      onChange={onChange}
      placeholder="Describe more about your pet..."
      rows={4}
      className={PET_FORM_STYLES.input.textarea}
    />
  </div>
);