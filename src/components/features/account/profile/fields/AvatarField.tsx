import * as React from "react";
import { Control } from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/profile";
import AvatarUploader from "@/components/form/AvatarUpload";
import { FormField } from "./FormField";
import { handleFileToDataURL } from "../utils/file";
import { FORM_CONFIG } from "../utils/config";

export const AvatarField: React.FC<{
  control: Control<OwnerProfileInput>;
}> = ({ control }) => (
  <FormField control={control} name="image">
    {(field) => {
      const value = typeof field.value === "string" ? field.value : "";
      return (
        <div className={FORM_CONFIG.styles.avatarContainer}>
          <div className="inline-block cursor-pointer [&_*]:cursor-pointer [&_svg]:pointer-events-none">
            <AvatarUploader
              imageUrl={value}
              onChange={async (file: File | null) => {
                if (!file) {
                  field.onChange(undefined);
                  return;
                }
                const dataURL = await handleFileToDataURL(file);
                field.onChange(dataURL);
              }}
              diameterPx={176}
              priority={true} 
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground cursor-pointer">
          </p>
        </div>
      );
    }}
  </FormField>
);