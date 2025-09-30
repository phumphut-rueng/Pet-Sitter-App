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
import DatePicker from "@/components/date-picker/DatePicker"; 

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
    error: "rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700",
    // ทำให้ container และ label ของ avatar เป็น pointer
    avatarContainer: "w-fit cursor-pointer",
    avatarHelp: "mt-2 text-xs text-muted-foreground",
    grid: "grid gap-4 md:grid-cols-2",
    buttonContainer: "flex justify-end",
    hiddenSubmit: "sr-only",
  },
};

const formatIdNumber = (v: string): string => v.replace(/\D/g, "").slice(0, 13);
type InputVariant = "default" | "error" | "success";
const getInputVariant = (hasError: boolean): InputVariant =>
  hasError ? "error" : "default";

/** === Helpers แปลงวันที่ === */
const toYmd = (d?: Date) =>
  d
    ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10)
    : "";

const parseYmd = (s?: string) => {
  if (!s) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return undefined;
  const [, yyyy, mm, dd] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(d.getTime()) ? undefined : d;
};

function FormField<Name extends Path<OwnerProfileInput>>(props: FormFieldProps<Name>) {
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

const AvatarField: React.FC<{ control: Control<OwnerProfileInput> }> = ({ control }) => (
  <FormField control={control} name={"image"}>
    {(field) => {
      const value = typeof field.value === "string" ? field.value : "";
      return (
        <div className={FORM_CONFIG.styles.avatarContainer}>
          <div className="inline-block cursor-pointer [&_*]:cursor-pointer [&_svg]:pointer-events-none">
            <AvatarUploader imageUrl={value} onChange={field.onChange} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground cursor-pointer">
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

const IdNumberField: React.FC<{ control: Control<OwnerProfileInput> }> = ({ control }) => (
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

/** === ใช้ DatePicker ของเพื่อนแทน input type="date" === */
const sameMonth = (a?: Date, b?: Date) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const clampDay = (y: number, m: number, d: number) =>
  Math.min(d, new Date(y, m + 1, 0).getDate());

type DobInnerProps = {
  value?: string;
  onChange: (next: string) => void;
  error?: string;
};

const DobPickerInner: React.FC<DobInnerProps> = ({ value, onChange, error }) => {
  const [month, setMonth] = React.useState<Date | undefined>(undefined);

  const selected = React.useMemo(() => parseYmd(value), [value]);

  React.useEffect(() => {
    if (!selected) {
      setMonth((prev) => (prev ? undefined : prev));
      return;
    }
    const m = new Date(selected.getFullYear(), selected.getMonth(), 1);
    setMonth((prev) => (sameMonth(prev, m) ? prev : m));
  }, [selected]);

  const handleSelect = (d?: Date) => {
    const next = toYmd(d);
    const prev = value ?? "";
    if (next !== prev) onChange(next);
  };

  const handleMonthChange = (m?: Date) => {
    setMonth((prev) => (sameMonth(prev, m) ? prev : m));
    if (!m || !selected) return;

    const day = clampDay(m.getFullYear(), m.getMonth(), selected.getDate());
    let nextDate = new Date(m.getFullYear(), m.getMonth(), day);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (nextDate > today) nextDate = today;

    const nextStr = toYmd(nextDate);
    const prevStr = value ?? "";
    if (nextStr !== prevStr) onChange(nextStr);
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="date" className="text-sm font-medium text-gray-700">
        Date of Birth
      </label>


      <div className="[&_#date]:bg-white [&_#date]:text-black [&_#date]:border-gray-300 [&_button]:cursor-pointer">
        <DatePicker
          date={selected}
          month={month}
          onMonthChange={handleMonthChange}
          onSelect={handleSelect}
          rules={{ maxDate: new Date() }}
          width={400}
        />
      </div>

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
};

const DobDatePickerField: React.FC<{ control: Control<OwnerProfileInput> }> = ({ control }) => (
  <FormField control={control} name={"dob"}>
    {(field, fieldState) => (
      <DobPickerInner
        value={field.value as string | undefined}
        onChange={field.onChange}
        error={fieldState.error?.message}
      />
    )}
  </FormField>
);

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
        <DobDatePickerField control={control} />
      </div>

      <div className={FORM_CONFIG.styles.buttonContainer}>
        <PrimaryButton {...submitButtonProps} />
        <button type="submit" className={FORM_CONFIG.styles.hiddenSubmit} aria-hidden />
      </div>
    </form>
  );
}