const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "include",
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const ct = res.headers.get("content-type") || "";
      const raw: unknown = ct.includes("json") ? await res.json() : await res.text();
      if (typeof raw === "string") message = raw || message;
      else if (isRecord(raw) && typeof raw.error === "string") message = raw.error;
      else if (isRecord(raw) && typeof raw.message === "string") message = raw.message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return res.status === 204 ? (undefined as unknown as T) : ((await res.json()) as T);
}

export type ValidationField = "name" | "email" | "phone";

export async function checkUnique(field: ValidationField, value: string) {
  const r = await apiRequest<{ unique: boolean }>("/api/user/unique-check", {
    method: "POST",
    body: JSON.stringify({ field, value }),
  });
  if (!r.unique) throw new Error(`${field}_taken`);
}