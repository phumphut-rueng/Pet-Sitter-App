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
  name: string;
  email: string;
  phone: string;
  idNumber?: string | null;
  dob?: string | null;
  profileImage?: string | null;
};

type UniqueCheckResponse = {
  unique: boolean;
};

type ValidationField = "name" | "email" | "phone";


const formatDate = {
  toYmd: (input?: string | null): string | undefined => {
    if (!input) return undefined;
    const trimmed = input.trim();
    const ddmmyyyy = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const yyyymmdd = /^(\d{4})[\/-](\d{2})[\/-](\d{2})$/;

    if (ddmmyyyy.test(trimmed)) {
      const [, dd, mm, yyyy] = trimmed.match(ddmmyyyy)!;
      return `${yyyy}-${mm}-${dd}`;
    }
    if (yyyymmdd.test(trimmed)) {
      const [, yyyy, mm, dd] = trimmed.match(yyyymmdd)!;
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

  trimString: (value?: string | null): string => {
    return (value ?? "").trim();
  },
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return ERROR_MESSAGES.unknown;
  }
};


const api = {
  request: async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      credentials: "include",
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("json")
          ? await response.json()
          : await response.text();

        if (typeof body === "string") message = body || message;
        else if (body?.error) message = body.error;
        else if (body?.message) message = body.message;
      } catch {
      }
      throw new Error(message);
    }

    return response.status === 204
      ? (undefined as unknown as T)
      : ((await response.json()) as T);
  },

  /**  เช็คซ้ำผ่าน endpoint เดียว */
  checkUnique: async (field: ValidationField, value: string): Promise<void> => {
    const data = await api.request<UniqueCheckResponse>(
      API_ENDPOINTS.uniqueCheck,
      {
        method: "POST",
        body: JSON.stringify({ field, value }),
      }
    );
    if (!data.unique) {
      throw new Error(`${field}_taken`);
    }
  },
};

const validateUniqueness = {
  name: async (name?: string | null): Promise<void> => {
    const trimmed = sanitize.trimString(name);
    if (!trimmed) return;
    await api.checkUnique("name", trimmed);
  },

  email: async (email?: string | null): Promise<void> => {
    const trimmed = sanitize.trimString(email);
    if (!trimmed) return;
    await api.checkUnique("email", trimmed);
  },

  phone: async (phone?: string | null): Promise<void> => {
    const digits = sanitize.onlyDigits(phone);
    if (!digits) return;
    await api.checkUnique("phone", digits);
  },
};


const transformData = {
  fromApiToForm: (profile: OwnerProfile): OwnerProfileInput => ({
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    idNumber: profile?.idNumber ?? "",
    dob: profile?.dob ?? "",
    image: profile?.profileImage ?? undefined,
  }),

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

  toStorageFormat: (values: OwnerProfileInput): OwnerProfile => ({
    name: sanitize.trimString(values.name),
    email: sanitize.trimString(values.email),
    phone: sanitize.onlyDigits(values.phone) ?? "",
    idNumber: sanitize.trimString(values.idNumber),
    dob: formatDate.toYmd(values.dob) ?? "",
    profileImage:
      typeof values.image === "string" ? sanitize.trimString(values.image) : "",
  }),
};

/* ---- Hook Implementation ---- */
export function useOwnerProfileForm() {
  const initialRef = useRef<OwnerProfile | null>(null);

  const form = useForm<OwnerProfileInput>({
    resolver: zodResolver(ownerProfileSchema),
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  const load = useCallback(async (): Promise<void> => {
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

  const validateUniqueFields = useCallback(
    async (values: OwnerProfileInput) => {
      const changes = checkChanges(values);

      const validationPromises: Promise<void>[] = [
        changes.name ? validateUniqueness.name(values.name) : Promise.resolve(),
        changes.email
          ? validateUniqueness.email(values.email)
          : Promise.resolve(),
        changes.phone
          ? validateUniqueness.phone(values.phone)
          : Promise.resolve(),
      ];

      const results = await Promise.allSettled(validationPromises);
      const [nameResult, emailResult, phoneResult] = results;

      let hasError = false;
      if (nameResult.status === "rejected") {
        form.setError("name", { message: ERROR_MESSAGES.nameTaken });
        hasError = true;
      }
      if (emailResult.status === "rejected") {
        form.setError("email", { message: ERROR_MESSAGES.emailTaken });
        hasError = true;
      }
      if (phoneResult.status === "rejected") {
        form.setError("phone", { message: ERROR_MESSAGES.phoneTaken });
        hasError = true;
      }

      return !hasError;
    },
    [form, checkChanges]
  );

  const save = useCallback(
    async (values: OwnerProfileInput): Promise<boolean> => {
      // Check uniqueness first
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
      } catch (error: unknown) {
        const message = getErrorMessage(error);

        if (message.includes("email_taken")) {
          form.setError("email", { message: ERROR_MESSAGES.emailTaken });
          return false;
        }
        if (message.includes("phone_taken")) {
          form.setError("phone", { message: ERROR_MESSAGES.phoneTaken });
          return false;
        }
        if (message.startsWith("HTTP 400")) {
          form.setError("dob", { message: ERROR_MESSAGES.invalidDate });
          return false;
        }
        throw error;
      }
    },
    [form, validateUniqueFields]
  );

  const checkEmailUnique = async (email: string): Promise<true | string> => {
    const trimmed = sanitize.trimString(email);
    if (!trimmed) return true;
    try {
      await validateUniqueness.email(trimmed);
      return true;
    } catch {
      return ERROR_MESSAGES.emailTaken;
    }
  };

  const checkPhoneUnique = async (phone: string): Promise<true | string> => {
    const digits = sanitize.onlyDigits(phone);
    if (!digits) return true;
    try {
      await validateUniqueness.phone(digits);
      return true;
    } catch {
      return ERROR_MESSAGES.phoneTaken;
    }
  };

  return { form, load, save, checkEmailUnique, checkPhoneUnique };
}