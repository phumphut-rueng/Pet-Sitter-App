import type { OwnerProfileInput } from "@/lib/validators/profile";
import { cldUrl } from "@/lib/cloudinary/client";
import { sanitize, formatDate } from "@/lib/utils/strings";

export type OwnerProfileDTO = {
  name: string | null;
  email: string | null;
  phone: string | null;
  idNumber?: string | null;
  dob?: string | null;
  profileImage?: string | null;            // legacy url
  profileImagePublicId?: string | null;    // camel
  profile_image_public_id?: string | null; // snake
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
    name: sanitize.trimString(v.name) || undefined,
    email: sanitize.trimString(v.email) || undefined,
    phone: sanitize.onlyDigits(v.phone),
    dob: formatDate.toYmd(v.dob),
  }),

  toStorageFormat: (v: OwnerProfileInput): OwnerProfileDTO => ({
    name: sanitize.trimString(v.name),
    email: sanitize.trimString(v.email),
    phone: sanitize.onlyDigits(v.phone) ?? "",
    idNumber: sanitize.trimString(v.idNumber),
    dob: formatDate.toYmd(v.dob) ?? "",
    profileImage: typeof v.image === "string" ? sanitize.trimString(v.image) : "",
  }),
};