import type { OwnerProfileInput } from "@/lib/validators/profile";
import { cldUrl } from "@/lib/cloudinary/client";
import { sanitizeDigits, trimString, toYmd } from "@/lib/utils/strings";

export type OwnerProfileDTO = {
  name: string | null;
  email: string | null;
  phone: string | null;
  idNumber?: string | null;
  dob?: string | null;
  profileImage?: string | null;
  profileImagePublicId?: string | null;
  profile_image_public_id?: string | null;
};

export const DEFAULT_VALUES: OwnerProfileInput = {
  name: "",
  email: "",
  phone: "",
  idNumber: "",
  dob: "",
  image: undefined,
};

export const transformData = {
  fromApiToForm: (p: OwnerProfileDTO): OwnerProfileInput => {
    const email = p.email ?? "";
    const rawName = p.name ?? "";
    const cleanName = !rawName || rawName.includes("@") || rawName === email ? "" : rawName;
    const publicId = p.profileImagePublicId ?? p.profile_image_public_id ?? undefined;
    const legacyUrl = p.profileImage ?? "";

    return {
      name: cleanName,
      email,
      phone: p.phone ?? "",
      idNumber: p.idNumber ?? "",
      dob: p.dob ?? "",
      image: publicId ? cldUrl(publicId, 256, 256) : (legacyUrl || undefined),
    };
  },

  fromFormToApi: (v: OwnerProfileInput) => ({
    name: trimString(v.name) || undefined,
    email: trimString(v.email) || undefined,
    phone: sanitizeDigits(v.phone),
    idNumber: trimString(v.idNumber) || undefined,
    dob: toYmd(v.dob),
  }),

  toStorageFormat: (v: OwnerProfileInput): OwnerProfileDTO => ({
    name: trimString(v.name),
    email: trimString(v.email),
    phone: sanitizeDigits(v.phone) ?? "",
    idNumber: trimString(v.idNumber),
    dob: toYmd(v.dob) ?? "",
    profileImage: typeof v.image === "string" ? trimString(v.image) : "",
  }),
};