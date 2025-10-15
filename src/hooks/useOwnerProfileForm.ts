import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import {
  ownerProfileSchema,
  type OwnerProfileInput,
} from "@/lib/validators/profile";

import {
  validateEmailUnique,
  validatePhoneUnique,
  validateUniqueFields,
  checkFieldChanges,
  VALIDATION_ERROR_MESSAGES,
} from "@/lib/validators/helpers";

import { api } from "@/lib/api/axios"; 
import { uploadAndGetPublicId } from "@/lib/cloudinary/image-upload";
import { toErrorMessage } from "@/lib/utils/strings";
import {
  transformData,
  DEFAULT_VALUES,
  type OwnerProfileDTO,
} from "@/components/features/account/profile/transform";

// helpers

const isDataUrl = (s?: string): boolean =>
  !!s && /^data:image\/[a-zA-Z]+;base64,/.test(s);

async function dataUrlToFile(dataUrl: string, filename = "profile.png"): Promise<File> {
  const response = await axios.get(dataUrl, {
    responseType: 'blob'
  });
  
  const blob = response.data;
  return new File([blob], filename, { type: blob.type || "image/png" });
}

function toFormShape(v: unknown): Partial<OwnerProfileInput> {
  const r = (v ?? {}) as Record<string, unknown>;
  return {
    name: (r.name as string) ?? "",
    email: (r.email as string) ?? "",
    phone: (r.phone as string) ?? "",
    image: (r.image as unknown) ?? undefined,
    idNumber: (r.idNumber as string | null | undefined) ?? undefined, 
    dob: (r.dob as string | null | undefined) ?? undefined,
  };
}

// main hook

export function useOwnerProfileForm() {
  const initialRef = useRef<Partial<OwnerProfileInput> | null>(null);

  const form = useForm<OwnerProfileInput>({
    resolver: zodResolver(ownerProfileSchema),
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  // load profile
  const load = useCallback(async () => {
    const { data: profile } = await api.get<OwnerProfileDTO>("/user/profile");

    const formData = transformData.fromApiToForm(profile);
    const shaped = toFormShape(formData);
    initialRef.current = shaped;
    form.reset(shaped);
  }, [form]);

  // validate before save
  const validateBeforeSave = useCallback(
    async (values: OwnerProfileInput) => {
      const changes = checkFieldChanges(
        initialRef.current,
        values,
        ["name", "email", "phone"] as const
      );

      const fieldsToCheck: Parameters<typeof validateUniqueFields>[0] = {};
      if (changes.name) fieldsToCheck.name = values.name;
      if (changes.email) fieldsToCheck.email = values.email;
      if (changes.phone) fieldsToCheck.phone = values.phone;

      if (Object.keys(fieldsToCheck).length === 0) return true;

      const errors = await validateUniqueFields(fieldsToCheck);
      if (errors.length > 0) {
        errors.forEach((err) => form.setError(err.field, { message: err.message }));
        return false;
      }
      return true;
    },
    [form]
  );

  // save profile
  const save = useCallback(
    async (values: OwnerProfileInput) => {
      const ok = await validateBeforeSave(values);
      if (!ok) return false;

      try {
        let public_id: string | undefined;
        let profile_url: string | undefined;

        if (typeof values.image === "string" && isDataUrl(values.image.trim())) {
          const file = await dataUrlToFile(values.image.trim(), "profile.png");
          const up = await uploadAndGetPublicId(file, "owner-profile");
          public_id = up.public_id;
          profile_url = up.url;
        }

        const apiData = transformData.fromFormToApi(values);
        
        const body = {
          name: apiData.name,
          email: apiData.email,
          phone: apiData.phone,
          idNumber: apiData.idNumber,
          dob: apiData.dob,
          profile_image_public_id: public_id ?? undefined,
          profile_image: profile_url ?? undefined,
        };

        console.log("[useOwnerProfileForm] Sending body:", body);

        await api.put("/user/profile", body);

        await load();
        return true;
      } catch (err) {
        const message = toErrorMessage(err, VALIDATION_ERROR_MESSAGES.unknown);

        if (message.includes("email_taken") || message.includes("Email already")) {
          form.setError("email", { message: VALIDATION_ERROR_MESSAGES.emailTaken });
          return false;
        }
        if (message.includes("phone_taken") || message.includes("Phone already")) {
          form.setError("phone", { message: VALIDATION_ERROR_MESSAGES.phoneTaken });
          return false;
        }
        if (message.includes("id_number") || message.includes("ID Number already")) {
          form.setError("idNumber", { message: "ID Number already registered" });
          return false;
        }
        if (message.startsWith("HTTP 400") || message.toLowerCase().includes("date")) {
          form.setError("dob", { message: VALIDATION_ERROR_MESSAGES.invalidDate });
          return false;
        }
        throw err;
      }
    },
    [form, validateBeforeSave, load]
  );

  return {
    form,
    load,
    save,
    checkEmailUnique: validateEmailUnique,
    checkPhoneUnique: validatePhoneUnique,
  };
}