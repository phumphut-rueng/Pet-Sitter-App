import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ownerProfileSchema, type OwnerProfileInput } from "@/lib/validators/account";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const API_ENDPOINTS = {
  profile: "/api/user/profile",
  uniqueCheck: "/api/user/unique-check",
} as const;

const ERROR_MESSAGES = {
  nameTaken: "This name is already in use.",
  emailTaken: "This email is already in use.",
  phoneTaken: "This phone number is already in use.",
  invalidDate: "Invalid date. Use YYYY-MM-DD.",
  unknown: "Unknown error",
} as const;

const DEFAULT_VALUES: OwnerProfileInput = {
  name: "",
  email: "",
  phone: "",
  idNumber: "",
  dob: "",
  image: undefined,
};

type OwnerProfile = {
  name: string | null;
  email: string | null;
  phone: string | null;
  idNumber?: string | null;
  dob?: string | null;
  profileImage?: string | null;
};

type UniqueCheckResponse = { unique: boolean };
type ValidationField = "name" | "email" | "phone";

/* utils */
type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;

const formatDate = {
  toYmd: (input?: string | null): string | undefined => {
    if (!input) return undefined;
    const s = input.trim();
    const ddmmyyyy = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const yyyymmdd = /^(\d{4})[\/-](\d{2})[\/-](\d{2})$/;
    if (ddmmyyyy.test(s)) {
      const [, dd, mm, yyyy] = s.match(ddmmyyyy)!;
      return `${yyyy}-${mm}-${dd}`;
    }
    if (yyyymmdd.test(s)) {
      const [, yyyy, mm, dd] = s.match(yyyymmdd)!;
      return `${yyyy}-${mm}-${dd}`;
    }
    return undefined;
  },
};

const sanitize = {
  onlyDigits: (value?: string | null): string | undefined => {
    const digits = (value ?? "").replace(/\D/g, "");
    return digits || undefined;
  },
  trimString: (value?: string | null): string => (value ?? "").trim(),
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try { return JSON.stringify(error); } catch { return ERROR_MESSAGES.unknown; }
};

/* image helpers */
const isHttpUrl = (s?: string) => !!s && /^https?:\/\//i.test(s);
const isDataUrl = (s?: string) => !!s && /^data:image\/[a-zA-Z]+;base64,/.test(s);
async function dataUrlToFile(dataUrl: string, filename = "profile.png"): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

/* API */
const api = {
  request: async <T>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      credentials: "include",
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const contentType = res.headers.get("content-type") || "";
        const bodyRaw: unknown = contentType.includes("json") ? await res.json() : await res.text();
        if (typeof bodyRaw === "string") message = bodyRaw || message;
        else if (isRecord(bodyRaw) && typeof bodyRaw.error === "string") message = bodyRaw.error;
        else if (isRecord(bodyRaw) && typeof bodyRaw.message === "string") message = bodyRaw.message;
      } catch { /* ignore */ }
      throw new Error(message);
    }

    return res.status === 204
      ? (undefined as unknown as T)
      : ((await res.json()) as T);
  },

  checkUnique: async (field: ValidationField, value: string): Promise<void> => {
    const data = await api.request<UniqueCheckResponse>(API_ENDPOINTS.uniqueCheck, {
      method: "POST",
      body: JSON.stringify({ field, value }),
    });
    if (!data.unique) throw new Error(`${field}_taken`);
  },
};

/* map in/out */
const transformData = {
  fromApiToForm: (profile: OwnerProfile | UnknownRecord): OwnerProfileInput => {
    const email = (profile as OwnerProfile)?.email ?? "";
    const rawName = (profile as OwnerProfile)?.name ?? "";
    const cleanName = !rawName || rawName.includes("@") || rawName === email ? "" : rawName;

    const imageUrl =
      (profile as UnknownRecord)["profileImage"] ??
      (profile as UnknownRecord)["profile_image"] ??
      (profile as UnknownRecord)["profileImageUrl"] ??
      (profile as UnknownRecord)["image_url"] ??
      (profile as UnknownRecord)["imageUrl"] ??
      (profile as UnknownRecord)["image"] ??
      "";

    return {
      name: cleanName,
      email,
      phone: (profile as OwnerProfile)?.phone ?? "",
      idNumber:
        (profile as UnknownRecord)["idNumber"]?.toString() ??
        (profile as UnknownRecord)["id_number"]?.toString() ??
        "",
      dob:
        (profile as UnknownRecord)["dob"]?.toString() ??
        (profile as UnknownRecord)["date_of_birth"]?.toString() ??
        "",
      image: typeof imageUrl === "string" && imageUrl ? imageUrl : undefined,
    };
  },

  fromFormToApi: (values: OwnerProfileInput) => ({
    name: sanitize.trimString(values.name) || undefined,
    email: sanitize.trimString(values.email) || undefined,
    phone: sanitize.onlyDigits(values.phone),
    dob: formatDate.toYmd(values.dob),
  }),

  toStorageFormat: (v: OwnerProfileInput): OwnerProfile => ({
    name: sanitize.trimString(v.name),
    email: sanitize.trimString(v.email),
    phone: sanitize.onlyDigits(v.phone) ?? "",
    idNumber: sanitize.trimString(v.idNumber),
    dob: formatDate.toYmd(v.dob) ?? "",
    profileImage: typeof v.image === "string" ? sanitize.trimString(v.image) : "",
  }),
};

export function useOwnerProfileForm() {
  const initialRef = useRef<OwnerProfile | null>(null);

  const form = useForm<OwnerProfileInput>({
    resolver: zodResolver(ownerProfileSchema),
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  const load = useCallback(async () => {
    const profile = await api.request<OwnerProfile>(API_ENDPOINTS.profile, {
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
      phone:
        sanitize.onlyDigits(values.phone) !==
        sanitize.onlyDigits(initial?.phone ?? ""),
    };
  }, []);

  const validateUniqueFields = useCallback(async (values: OwnerProfileInput) => {
    const ch = checkChanges(values);
    const tasks: Promise<void>[] = [
      ch.name ? api.checkUnique("name", sanitize.trimString(values.name)) : Promise.resolve(),
      ch.email ? api.checkUnique("email", sanitize.trimString(values.email)) : Promise.resolve(),
      ch.phone ? api.checkUnique("phone", sanitize.onlyDigits(values.phone)!) : Promise.resolve(),
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
      let uploadedUrl: string | undefined;
      if (typeof values.image === "string") {
        const s = values.image.trim();
        if (isDataUrl(s)) {
          const file = await dataUrlToFile(s, "profile.png");
          uploadedUrl = await uploadToCloudinary(file, { folder: "owner-profile" });
        } else if (isHttpUrl(s) || s.startsWith("/")) {
          uploadedUrl = s;
        }
      }

      const base = transformData.fromFormToApi(values);
      const body: Record<string, unknown> = {
        name: base.name,
        email: base.email,
        phone: base.phone,
        dob: base.dob,
        profileImage: uploadedUrl ?? undefined,
      };

      await api.request<unknown>(API_ENDPOINTS.profile, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      await load(); // reload to reflect server truth
      return true;
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.includes("email_taken")) { form.setError("email", { message: ERROR_MESSAGES.emailTaken }); return false; }
      if (message.includes("phone_taken")) { form.setError("phone", { message: ERROR_MESSAGES.phoneTaken }); return false; }
      if (message.startsWith("HTTP 400")) { form.setError("dob", { message: ERROR_MESSAGES.invalidDate }); return false; }
      throw err;
    }
  }, [form, validateUniqueFields, load]);

  const checkEmailUnique = async (email: string) => {
    const v = sanitize.trimString(email);
    if (!v) return true as const;
    try { await api.checkUnique("email", v); return true as const; }
    catch { return ERROR_MESSAGES.emailTaken; }
  };

  const checkPhoneUnique = async (phone: string) => {
    const v = sanitize.onlyDigits(phone);
    if (!v) return true as const;
    try { await api.checkUnique("phone", v); return true as const; }
    catch { return ERROR_MESSAGES.phoneTaken; }
  };

  return { form, load, save, checkEmailUnique, checkPhoneUnique };
}