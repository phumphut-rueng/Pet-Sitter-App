import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ownerProfileSchema, type OwnerProfileInput } from "@/lib/validators/profile";
import {
  validateEmailUnique,
  validatePhoneUnique,
  validateUniqueFields,
  checkFieldChanges,
  VALIDATION_ERROR_MESSAGES,
} from "@/lib/validators/helpers";
import { api } from "@/lib/api/axios";
import { uploadAndGetPublicId } from "@/lib/cloudinary/image-upload";
import { toErrorMessage } from "@/lib/utils/error"; 
import {
  transformData,
  DEFAULT_VALUES,
  type OwnerProfileDTO,
} from "@/components/features/account/profile/transform";
import { isDataUrl, dataUrlToFile } from "@/lib/cloudinary/image-helpers";

function toFormValues(v: unknown): Partial<OwnerProfileInput> {
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

export function useOwnerProfileForm() {
  const initialRef = useRef<Partial<OwnerProfileInput> | null>(null);

  const form = useForm<OwnerProfileInput>({
    resolver: zodResolver(ownerProfileSchema),
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  const load = useCallback(async () => {
    const { data } = await api.get<OwnerProfileDTO>("/user/profile");
    const shaped = toFormValues(transformData.fromApiToForm(data));
    initialRef.current = shaped;
    form.reset(shaped);
  }, [form]);

  const validateBeforeSave = useCallback(
    async (values: OwnerProfileInput) => {
      const changed = checkFieldChanges(initialRef.current, values, ["name", "email", "phone"] as const);

      const needCheck: Parameters<typeof validateUniqueFields>[0] = {};
      if (changed.name) needCheck.name = values.name;
      if (changed.email) needCheck.email = values.email;
      if (changed.phone) needCheck.phone = values.phone;

      if (Object.keys(needCheck).length === 0) return true;

      const errors = await validateUniqueFields(needCheck);
      if (errors.length > 0) {
        errors.forEach((e) => form.setError(e.field, { message: e.message }));
        return false;
      }
      return true;
    },
    [form]
  );

  const save = useCallback(
    async (values: OwnerProfileInput) => {
      const ok = await validateBeforeSave(values);
      if (!ok) return false;

      try {
        let public_id: string | undefined;
        let profile_url: string | undefined;

        if (typeof values.image === "string" && isDataUrl(values.image.trim())) {
          const file = await dataUrlToFile(values.image.trim(), "profile.png");
          const uploaded = await uploadAndGetPublicId(file, "owner-profile");
          public_id = uploaded.public_id;
          profile_url = uploaded.url;
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

        await api.put("/user/profile", body);
        await load();
        return true;
      } catch (err) {
        const msg = toErrorMessage(err, VALIDATION_ERROR_MESSAGES.unknown);

        if (msg.includes("email_taken") || msg.includes("Email already")) {
          form.setError("email", { message: VALIDATION_ERROR_MESSAGES.emailTaken });
          return false;
        }
        if (msg.includes("phone_taken") || msg.includes("Phone already")) {
          form.setError("phone", { message: VALIDATION_ERROR_MESSAGES.phoneTaken });
          return false;
        }
        if (msg.includes("id_number") || msg.includes("ID Number already")) {
          form.setError("idNumber", { message: "ID Number already registered" });
          return false;
        }
        if (msg.startsWith("HTTP 400") || msg.toLowerCase().includes("date")) {
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