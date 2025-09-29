import * as React from "react";
import {
  Control,
  Controller,
  ControllerRenderProps,
  ControllerFieldState,
  Path,
} from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/account";
import InputText from "@/components/input/InputText";
import AvatarUploader from "@/components/form/AvatarUpload";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { cn } from "@/lib/utils";


export interface ProfileFormProps {
  control: Control<OwnerProfileInput>;
  onSubmit: () => void;
  saving?: boolean;
  serverError?: string | null;
}

type FormFieldProps<Name extends Path<OwnerProfileInput>> = {
  control: Control<OwnerProfileInput>;
  name: Name;
  children: (
    field: ControllerRenderProps<OwnerProfileInput, Name>,
    fieldState: ControllerFieldState
  ) => React.ReactElement;
};

type FieldConfig = {
  id: string;
  label: string;
  placeholder?: string;
  type: string;
  autoComplete?: string;
  inputMode?:
    | "text"
    | "email"
    | "tel"
    | "numeric"
    | "search"
    | "none"
    | "url"
    | "decimal";
  pattern?: string;
  maxLength?: number;
};


const FORM_CONFIG = {
  fields: {
    name: {
      id: "name",
      label: "Your Name*",
      placeholder: "John Wick",
      type: "text",
      autoComplete: "name",
    },
    email: {
      id: "email",
      label: "Email*",
      placeholder: "johnwick@dogorg.com",
      type: "email",
      autoComplete: "email",
    },
    phone: {
      id: "phone",
      label: "Phone*",
      placeholder: "099 996 6734",
      type: "tel",
      inputMode: "tel",
      pattern: "^0\\d{9}$",
      autoComplete: "tel",
    },
    idNumber: {
      id: "idNumber",
      label: "ID Number",
      placeholder: "13 digits",
      type: "text",
      inputMode: "numeric",
      pattern: "^\\d{13}$",
      maxLength: 13,
    },
    dob: {
      id: "dob",
      label: "Date of Birth",
      type: "date",
      placeholder: "YYYY-MM-DD",
    },
  } as const,
  styles: {
    form: "text-ink space-y-6",
    error:
      "rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700",
    avatarContainer: "w-fit",
    avatarHelp: "mt-2 text-xs text-muted-foreground",
    grid: "grid gap-4 md:grid-cols-2",
    buttonContainer: "flex justify-end",
    hiddenSubmit: "sr-only",
  },
};


const getTodayString = (): string => new Date().toISOString().slice(0, 10);
const formatIdNumber = (v: string): string => v.replace(/\D/g, "").slice(0, 13);
type InputVariant = "default" | "error" | "success";
const getInputVariant = (hasError: boolean): InputVariant =>
  hasError ? "error" : "default";


function FormField<Name extends Path<OwnerProfileInput>>(
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

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className={FORM_CONFIG.styles.error}>{message}</div>
);


const AvatarField: React.FC<{ control: Control<OwnerProfileInput> }> = ({
  control,
}) => (
  <FormField control={control} name={"image"}>
    {(field) => {
      const value = typeof field.value === "string" ? field.value : "";
      return (
        <div className={FORM_CONFIG.styles.avatarContainer}>
          <AvatarUploader imageUrl={value} onChange={field.onChange} />
          <p className={FORM_CONFIG.styles.avatarHelp}>
            Profile Image (optional)
          </p>
        </div>
      );
    }}
  </FormField>
);

const TextInputField: React.FC<{
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

const IdNumberField: React.FC<{ control: Control<OwnerProfileInput> }> = ({
  control,
}) => (
  <FormField control={control} name={"idNumber"}>
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

const DateField: React.FC<{ control: Control<OwnerProfileInput> }> = ({
  control,
}) => {
  const today = React.useMemo(() => getTodayString(), []);
  return (
    <FormField control={control} name={"dob"}>
      {(field, fieldState) => (
        <InputText
          {...FORM_CONFIG.fields.dob}
          name="dob"
          placeholder={FORM_CONFIG.fields.dob.placeholder ?? ""}
          value={(field.value as string | undefined) ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          max={today}
          variant={getInputVariant(!!fieldState.error)}
          errorText={fieldState.error?.message ?? ""}
          aria-invalid={!!fieldState.error}
          onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
        />
      )}
    </FormField>
  );
};


export default function ProfileForm({
  control,
  onSubmit,
  saving = false,
  serverError,
}: ProfileFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saving) onSubmit();
  };

  const submitButtonProps = {
    text: saving ? "Saving..." : "Update Profile",
    bgColor: "primary",
    textColor: "white",
    className: cn(
      "px-6 rounded-full transition hover:opacity-95 focus:outline-none",
      saving && "opacity-50 pointer-events-none"
    ),
    onClick: () => {
      if (!saving) onSubmit();
    },
  } satisfies React.ComponentProps<typeof PrimaryButton>;

  return (
    <form
      onSubmit={handleSubmit}
      className={FORM_CONFIG.styles.form}
      aria-label="Owner profile form"
    >
      {serverError && <ErrorMessage message={serverError} />}

      <AvatarField control={control} />

      <TextInputField control={control} name={"name"} config={FORM_CONFIG.fields.name} />

      <div className={FORM_CONFIG.styles.grid}>
        <TextInputField control={control} name={"email"} config={FORM_CONFIG.fields.email} />
        <TextInputField control={control} name={"phone"} config={FORM_CONFIG.fields.phone} />
      </div>

      <div className={FORM_CONFIG.styles.grid}>
        <IdNumberField control={control} />
        <DateField control={control} />
      </div>

      <div className={FORM_CONFIG.styles.buttonContainer}>
        <PrimaryButton {...submitButtonProps} />
        <button type="submit" className={FORM_CONFIG.styles.hiddenSubmit} aria-hidden />
      </div>
    </form>
  );
}