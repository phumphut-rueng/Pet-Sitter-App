import * as React from "react";
import { Control, Path } from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/profile";
import InputText from "@/components/input/InputText";
import { FormField } from "./FormField";
import { FieldConfig, getInputVariant } from "../utils/config";

export const TextInputField: React.FC<{
  control: Control<OwnerProfileInput>;
  name: Path<OwnerProfileInput>;
  config: FieldConfig;
  customProps?: Partial<React.ComponentProps<typeof InputText>>;
}> = ({ control, name, config, customProps }) => {
  const isPhoneField = name === "phone";

  return (
    <FormField control={control} name={name}>
      {(field, fieldState) => (
        <InputText
          {...config}
          name={name}
          placeholder={config.placeholder ?? ""}
          value={(field.value as string | undefined) ?? ""}
          onChange={(e) => {
            if (isPhoneField) {
              // กรองให้เหลือแต่ตัวเลข และไม่เกิน 10 ตัว
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              field.onChange(value);
            } else {
              field.onChange(e);
            }
          }}
          onBlur={field.onBlur}
          variant={getInputVariant(!!fieldState.error)}
          errorText={fieldState.error?.message ?? ""}
          aria-invalid={!!fieldState.error}
          maxLength={isPhoneField ? 10 : undefined}
          {...customProps}
        />
      )}
    </FormField>
  );
};