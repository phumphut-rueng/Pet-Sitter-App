import * as React from "react";
import {
  Control,
  Controller,
  ControllerRenderProps,
  ControllerFieldState,
  Path,
} from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/profile";

type FormFieldProps<Name extends Path<OwnerProfileInput>> = {
  control: Control<OwnerProfileInput>;
  name: Name;
  children: (
    field: ControllerRenderProps<OwnerProfileInput, Name>,
    fieldState: ControllerFieldState
  ) => React.ReactElement;
};

export function FormField<Name extends Path<OwnerProfileInput>>(
  props: FormFieldProps<Name>
) {
  const { control, name, children } = props;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => children(field, fieldState)}
    />
  );
}