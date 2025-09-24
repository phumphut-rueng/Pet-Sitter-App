import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ownerProfileSchema,
  type OwnerProfileInput,
} from "@/lib/validators/account";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type OwnerProfile = {
  name: string;
  email: string;
  phone: string;
  idNumber?: string | null;
  dob?: string | null;
  imageUrl?: string | null;
};

async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    credentials: "include", // ถ้าใช้ cookie-based auth
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if ((data as { message?: string })?.message) message = data.message!;
    } catch {}
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export function useOwnerProfileForm() {
  const form = useForm<OwnerProfileInput>({
    resolver: zodResolver(ownerProfileSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      idNumber: "",
      dob: "",
      image: undefined,
    },
  });

  const load = useCallback(async (): Promise<void> => {
    const me = await requestJSON<OwnerProfile>("/api/user/get-owner");
    form.reset({
      name: me?.name ?? "",
      email: me?.email ?? "",
      phone: me?.phone ?? "",
      idNumber: me?.idNumber ?? "",
      dob: me?.dob ?? "",
      image: undefined,
    });
  }, [form]);

  const checkEmailUnique = async (email: string) => {
    if (!email) return true;
    try {
      const ok = await requestJSON<boolean>(
        `/api/user/check-email?email=${encodeURIComponent(email)}`
      );
      return ok || "This email is already taken";
    } catch {
      // ถ้าเช็คไม่สำเร็จ อย่าบล็อคผู้ใช้
      return true;
    }
  };

  const checkPhoneUnique = async (phone: string) => {
    if (!phone) return true;
    try {
      const ok = await requestJSON<boolean>(
        `/api/user/check-phone?phone=${encodeURIComponent(phone)}`
      );
      return ok || "This phone is already taken";
    } catch {
      return true;
    }
  };

  const save = useCallback(async (values: OwnerProfileInput): Promise<void> => {
    await requestJSON<unknown>("/api/user/put-owner", {
      method: "PUT",
      body: JSON.stringify(values),
    });
  }, []);

  return { form, load, save, checkEmailUnique, checkPhoneUnique };
}