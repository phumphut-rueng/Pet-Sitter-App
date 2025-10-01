import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ownerProfileSchema, type OwnerProfileInput } from "@/lib/validators/account";

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

/** utils */
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

/** API */
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
        const body = contentType.includes("json") ? await res.json() : await res.text();
        if (typeof body === "string") message = body || message;
        else if (body?.error) message = body.error;
        else if (body?.message) message = body.message;
      } catch {}
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

const validateUniqueness = {
  name: async (name?: string | null) => {
    const v = sanitize.trimString(name);
    if (!v) return;
    await api.checkUnique("name", v);
  },
  email: async (email?: string | null) => {
    const v = sanitize.trimString(email);
    if (!v) return;
    await api.checkUnique("email", v);
  },
  phone: async (phone?: string | null) => {
    const v = sanitize.onlyDigits(phone);
    if (!v) return;
    await api.checkUnique("phone", v);
  },
};

/** แปลงข้อมูลเข้า/ออก + กันกรณี name เป็นอีเมล */
const transformData = {
  fromApiToForm: (profile: OwnerProfile): OwnerProfileInput => {
    const email = profile?.email ?? "";
    const rawName = profile?.name ?? "";
    const cleanName =
      !rawName || rawName.includes("@") || rawName === email ? "" : rawName;

    return {
      name: cleanName,
      email,
      phone: profile?.phone ?? "",
      idNumber: profile?.idNumber ?? "",
      dob: profile?.dob ?? "",
      image: profile?.profileImage ?? undefined,
    };
  },

  fromFormToApi: (values: OwnerProfileInput) => ({
    name: sanitize.trimString(values.name) || undefined,
    email: sanitize.trimString(values.email) || undefined,
    phone: sanitize.onlyDigits(values.phone),
    dob: formatDate.toYmd(values.dob),
    profileImage:
      typeof values.image === "string"
        ? sanitize.trimString(values.image) || undefined
        : undefined,
  }),

  toStorageFormat: (v: OwnerProfileInput): OwnerProfile => ({
    name: sanitize.trimString(v.name),
    email: sanitize.trimString(v.email),
    phone: sanitize.onlyDigits(v.phone) ?? "",
    idNumber: sanitize.trimString(v.idNumber),
    dob: formatDate.toYmd(v.dob) ?? "",
    profileImage:
      typeof v.image === "string" ? sanitize.trimString(v.image) : "",
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
    const profile = await api.request<OwnerProfile>(API_ENDPOINTS.profile);
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
      ch.name ? validateUniqueness.name(values.name) : Promise.resolve(),
      ch.email ? validateUniqueness.email(values.email) : Promise.resolve(),
      ch.phone ? validateUniqueness.phone(values.phone) : Promise.resolve(),
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
      const payload = transformData.fromFormToApi(values);
      await api.request<unknown>(API_ENDPOINTS.profile, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      initialRef.current = transformData.toStorageFormat(values);
      return true;
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.includes("email_taken")) { form.setError("email", { message: ERROR_MESSAGES.emailTaken }); return false; }
      if (message.includes("phone_taken")) { form.setError("phone", { message: ERROR_MESSAGES.phoneTaken }); return false; }
      if (message.startsWith("HTTP 400")) { form.setError("dob", { message: ERROR_MESSAGES.invalidDate }); return false; }
      throw err;
    }
  }, [form, validateUniqueFields]);

  const checkEmailUnique = async (email: string) => {
    const v = sanitize.trimString(email);
    if (!v) return true as const;
    try { await validateUniqueness.email(v); return true as const; }
    catch { return ERROR_MESSAGES.emailTaken; }
  };

  const checkPhoneUnique = async (phone: string) => {
    const v = sanitize.onlyDigits(phone);
    if (!v) return true as const;
    try { await validateUniqueness.phone(v); return true as const; }
    catch { return ERROR_MESSAGES.phoneTaken; }
  };

  return { form, load, save, checkEmailUnique, checkPhoneUnique };
}