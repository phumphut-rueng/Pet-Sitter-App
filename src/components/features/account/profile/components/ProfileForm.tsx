import * as React from "react";
import { Control } from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/profile";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { cn } from "@/lib/utils/utils";
import { AvatarField } from "../fields/AvatarField";
import { TextInputField } from "../fields/TextInputField";
import { IdNumberField } from "../fields/IdNumberField";
import { DobDatePickerField } from "../fields/DobDatePickerField";
import { FORM_CONFIG } from "../utils/config";

export interface ProfileFormProps {
  control: Control<OwnerProfileInput>;
  onSubmit: () => void;
  saving?: boolean;
  serverError?: string | null;
}

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-base-medium text-red bg-pink-bg border border-red/20 rounded-lg px-4 py-3">
    {message}
  </div>
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
      "px-6 rounded-full transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg",
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

      <TextInputField
        control={control}
        name="name"
        config={FORM_CONFIG.fields.name}
      />

      <div className={FORM_CONFIG.styles.grid}>
        <TextInputField
          control={control}
          name="email"
          config={FORM_CONFIG.fields.email}
        />
        <TextInputField
          control={control}
          name="phone"
          config={FORM_CONFIG.fields.phone}
        />
      </div>

      <div className={FORM_CONFIG.styles.grid}>
        <IdNumberField control={control} />
        <DobDatePickerField control={control} />
      </div>

      <div className={FORM_CONFIG.styles.buttonContainer}>
        <PrimaryButton {...submitButtonProps} />
        <button
          type="submit"
          className={FORM_CONFIG.styles.hiddenSubmit}
          aria-hidden
        />
      </div>
    </form>
  );
}