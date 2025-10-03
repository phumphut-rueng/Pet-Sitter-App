import * as React from "react";
import { Control, Path } from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/account";
import InputText from "@/components/input/InputText";
import { FormField } from "./FormField";
import { FieldConfig, getInputVariant } from "../utils/config";

export const TextInputField: React.FC<{
  control: Control<OwnerProfileInput>;
  name: Path<OwnerProfileInput>;
  config: FieldConfig;
  customProps?: Partial<React.ComponentProps<typeof InputText>>;
}> = ({ control, name, config, customProps }) => (
  <FormField control={control} name={name}>
    {(field, fieldState) => (
      <InputText
        {...config}
        name={name}
        placeholder={config.placeholder ?? ""}
        value={(field.value as string | undefined) ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        variant={getInputVariant(!!fieldState.error)}
        errorText={fieldState.error?.message ?? ""}
        aria-invalid={!!fieldState.error}
        {...customProps}
      />
    )}
  </FormField>
);