import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ownerProfileSchema, type OwnerProfileInput } from "@/lib/validators/account";

import { apiRequest, checkUnique } from "@/lib/api/api-client";
import { uploadAndGetPublicId } from "@/lib/cloudinary/image-upload";
import { toErrorMessage, sanitize } from "@/lib/utils/strings";
import { transformData, DEFAULT_VALUES, type OwnerProfileDTO } from "@/components/features/account/profile/transform";

const ERROR_MESSAGES = {
  nameTaken: "This name is already in use.",
  emailTaken: "This email is already in use.",
  phoneTaken: "This phone number is already in use.",
  invalidDate: "Invalid date. Use YYYY-MM-DD.",
  unknown: "Unknown error",
} as const;

const isDataUrl = (s?: string) => !!s && /^data:image\/[a-zA-Z]+;base64,/.test(s);
async function dataUrlToFile(dataUrl: string, filename = "profile.png"): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

export function useOwnerProfileForm() {
  const initialRef = useRef<OwnerProfileDTO | null>(null);

  const form = useForm<OwnerProfileInput>({
    resolver: zodResolver(ownerProfileSchema),
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  const load = useCallback(async () => {
    const profile = await apiRequest<OwnerProfileDTO>("/api/user/profile", {
      method: "GET",
      cache: "no-store",
    });
    const formData = transformData.fromApiToForm(profile);
    initialRef.current = transformData.toStorageFormat(formData);
    form.reset(formData);
  }, [form]);

  const checkChanges = useCallback((values: OwnerProfileInput) => {
    const initial = initialRef.current;
    return {
      name: sanitize.trimString(values.name) !== (initial?.name ?? ""),
      email: sanitize.trimString(values.email) !== (initial?.email ?? ""),
      phone: sanitize.onlyDigits(values.phone) !== sanitize.onlyDigits(initial?.phone ?? ""),
    };
  }, []);

  const validateUniqueFields = useCallback(async (values: OwnerProfileInput) => {
    const ch = checkChanges(values);
    const tasks: Promise<void>[] = [
      ch.name ? checkUnique("name", sanitize.trimString(values.name)) : Promise.resolve(),
      ch.email ? checkUnique("email", sanitize.trimString(values.email)) : Promise.resolve(),
      ch.phone ? checkUnique("phone", sanitize.onlyDigits(values.phone)!) : Promise.resolve(),
    ];
    const [r1, r2, r3] = await Promise.allSettled(tasks);
    let ok = true;
    if (r1.status === "rejected") { form.setError("name", { message: ERROR_MESSAGES.nameTaken }); ok = false; }
    if (r2.status === "rejected") { form.setError("email", { message: ERROR_MESSAGES.emailTaken }); ok = false; }
    if (r3.status === "rejected") { form.setError("phone", { message: ERROR_MESSAGES.phoneTaken }); ok = false; }
    return ok;
  }, [form, checkChanges]);

  const save = useCallback(async (values: OwnerProfileInput): Promise<boolean> => {
    const isUnique = await validateUniqueFields(values);
    if (!isUnique) return false;

    try {
      let public_id: string | undefined;
      if (typeof values.image === "string" && isDataUrl(values.image.trim())) {
        const file = await dataUrlToFile(values.image.trim(), "profile.png");
        const up = await uploadAndGetPublicId(file, "owner-profile");
        public_id = up.public_id;
      }

      const base = transformData.fromFormToApi(values);
      const body: Record<string, unknown> = {
        name: base.name,
        email: base.email,
        phone: base.phone,
        dob: base.dob,
        profile_image_public_id: public_id ?? undefined, // เก็บด้วย public_id เท่านั้น
      };

      await apiRequest<unknown>("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(body),
      });

      await load(); // sync state หลังบันทึก
      return true;
    } catch (err) {
      const message = toErrorMessage(err, ERROR_MESSAGES.unknown);
      if (message.includes("email_taken")) { form.setError("email", { message: ERROR_MESSAGES.emailTaken }); return false; }
      if (message.includes("phone_taken")) { form.setError("phone", { message: ERROR_MESSAGES.phoneTaken }); return false; }
      if (message.startsWith("HTTP 400")) { form.setError("dob", { message: ERROR_MESSAGES.invalidDate }); return false; }
      throw err;
    }
  }, [form, validateUniqueFields, load]);

  const checkEmailUnique = async (email: string) => {
    const v = sanitize.trimString(email);
    if (!v) return true as const;
    try { await checkUnique("email", v); return true as const; }
    catch { return ERROR_MESSAGES.emailTaken; }
  };

  const checkPhoneUnique = async (phone: string) => {
    const v = sanitize.onlyDigits(phone);
    if (!v) return true as const;
    try { await checkUnique("phone", v); return true as const; }
    catch { return ERROR_MESSAGES.phoneTaken; }
  };

  return { form, load, save, checkEmailUnique, checkPhoneUnique };
}