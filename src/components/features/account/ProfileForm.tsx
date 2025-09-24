import React from "react";
import { Control, Controller } from "react-hook-form";
import InputText from "@/components/input/InputText";
import AvatarUploader from "@/components/form/AvatarUpload";
import PrimaryButton from "@/components/buttons/primaryButton";
import { cn } from "@/lib/utils";

export type OwnerProfileValues = {
  name: string;
  email: string;
  phone: string;
  idNumber?: string;
  dob?: string;          // YYYY-MM-DD
  profileImage?: string; // URL/base64
};

type Props = {
  control: Control<OwnerProfileValues>;
  onSubmit: () => void;
  saving?: boolean;
  serverError?: string | null;
};

export default function ProfileForm({
  control,
  onSubmit,
  saving = false,
  serverError,
}: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!saving) onSubmit();
      }}

      className="text-ink space-y-6"
      aria-label="Owner profile form"
    >

      <div>
        <Controller
          control={control}
          name="profileImage"
          render={({ field }) => (

            <div className="w-fit">
              <AvatarUploader imageUrl={typeof field.value === "string" ? field.value : ""} />
              <p className="mt-2 text-xs text-muted-foreground">Profile Image (optional)</p>
            </div>
          )}
        />
      </div>

      {/* Name */}
      <div>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <div>
              <InputText
                label="Your Name*"
                placeholder="John Wick"
                type="text"
                value={field.value}
                onChange={field.onChange}
                variant={fieldState.error ? "error" : "default"}
                aria-invalid={!!fieldState.error}
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-destructive">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <div>
              <InputText
                label="Email*"
                placeholder="johnwick@dogorg.com"
                type="email"
                value={field.value}
                onChange={field.onChange}
                variant={fieldState.error ? "error" : "default"}
                aria-invalid={!!fieldState.error}
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-destructive">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <div>
              <InputText
                label="Phone*"
                placeholder="099 996 6734"
                type="tel"
                value={field.value}
                onChange={field.onChange}
                variant={fieldState.error ? "error" : "default"}
                aria-invalid={!!fieldState.error}
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-destructive">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      </div>


      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="idNumber"
          render={({ field, fieldState }) => (
            <div>
              <InputText
                label="ID Number"
                placeholder="13 digits"
                type="text"
                value={field.value ?? ""}
                onChange={field.onChange}
                variant={fieldState.error ? "error" : "default"}
                aria-invalid={!!fieldState.error}
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-destructive">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="dob"
          render={({ field, fieldState }) => (
            <div>
              <InputText
                label="Date of Birth"
                type="date"
                value={field.value || ""} // YYYY-MM-DD
                placeholder="YYYY-MM-DD"
                onChange={field.onChange}
                variant={fieldState.error ? "error" : "default"}
                aria-invalid={!!fieldState.error}
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-destructive">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      </div>

 
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}


      <div className="flex justify-end">
        <PrimaryButton
          text={saving ? "Saving..." : "Update Profile"}
          bgColor="primary"
          textColor="white"
          className={cn(
            "px-6 transition hover:opacity-95 focus:outline-none",
            saving && "opacity-50 pointer-events-none"
          )}
          onClick={() => {
            if (!saving) onSubmit();
          }}
        />

        <button type="submit" className="sr-only" aria-hidden />
      </div>
    </form>
  );
}