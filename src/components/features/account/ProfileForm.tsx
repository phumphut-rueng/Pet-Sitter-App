import React from "react";
import { Control, Controller } from "react-hook-form";
import InputText from "@/components/input/InputText";
import AvatarUploader from "@/components/form/avatarupload";
import PrimaryButton from "@/components/buttons/primaryButton"; 
import { cn } from "@/lib/utils";

export type OwnerProfileValues = {
  name: string;
  email: string;
  phone: string;
  idNumber?: string;
  dob?: string;
  profileImage?: string;
};

type Props = {
  control: Control<OwnerProfileValues>;
  onSubmit: () => void;
  saving?: boolean;
  serverError?: string | null;
};

export default function ProfileForm({ control, onSubmit, saving, serverError }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!saving) onSubmit();
      }}
      className="space-y-4 text-gray-900"
    >

      <Controller
        control={control}
        name="profileImage"
        render={({ field }) => (
          <div className="mb-2">
            <AvatarUploader
              imageUrl={typeof field.value === "string" ? field.value : ""}
            />
            <p className="text-xs text-gray-500 mt-2">Profile Image (optional)</p>
          </div>
        )}
      />


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
            />
            {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
          </div>
        )}
      />


      <div className="grid md:grid-cols-2 gap-4">
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
              />
              {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
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
              />
              {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </div>


      <div className="grid md:grid-cols-2 gap-4">
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
              />
              {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
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
                placeholder=""
                value={field.value || ""}  // ต้องเป็น "YYYY-MM-DD"
                onChange={field.onChange}
                variant={fieldState.error ? "error" : "default"}
              />
              {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex justify-end pt-2">
        {/* ปุ่มทีม (ไม่มี prop disabled/type) => ใช้เป็นปุ่มกดเรียก onSubmit + ใส่ class ปิดการกดตอนกำลังบันทึก */}
        <PrimaryButton
          text={saving ? "Saving..." : "Update Profile"}
          bgColor="primary"
          textColor="white"
          className={cn("px-6", saving && "opacity-60 pointer-events-none")}
          // ใช้ onClick แทน type="submit"
          onClick={() => {
            if (!saving) onSubmit();
          }}
        />
        {/* ปุ่ม submit จริง (รองรับการกด Enter ในฟอร์ม) */}
        <button type="submit" className="sr-only" aria-hidden />
      </div>
    </form>
  );
}