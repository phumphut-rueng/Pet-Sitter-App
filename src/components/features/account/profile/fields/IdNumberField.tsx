import * as React from "react";
import { Control } from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/account";
import InputText from "@/components/input/InputText";
import { FormField } from "./FormField";
import { formatIdNumber } from "../utils/id";
import { FORM_CONFIG, getInputVariant } from "../utils/config";

export const IdNumberField: React.FC<{
  control: Control<OwnerProfileInput>;
}> = ({ control }) => (
  <FormField control={control} name="idNumber">
    {(field, fieldState) => (
      <InputText
        {...FORM_CONFIG.fields.idNumber}
        name="idNumber"
        placeholder={FORM_CONFIG.fields.idNumber.placeholder ?? ""}
        value={(field.value as string | undefined) ?? ""}
        onChange={(e) => field.onChange(formatIdNumber(e.currentTarget.value))}
        onBlur={field.onBlur}
        variant={getInputVariant(!!fieldState.error)}
        errorText={fieldState.error?.message ?? ""}
        aria-invalid={!!fieldState.error}
      />
    )}
  </FormField>
);