import { useEffect, useState } from "react";
import type { OwnerRow, OwnerListResponse } from "@/types/admin/owners";

type Params = { page?: number; limit?: number; q?: string };

// ช่วยแปลง unknown → string อย่างปลอดภัย (เลี่ยง any)
function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Failed to fetch owners";
  }
}

export function useOwnersQuery({ page = 1, limit = 10, q = "" }: Params) {
  const [data, setData] = useState<OwnerListResponse | null>(null);
  const [items, setItems] = useState<OwnerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          q: q.trim(),
        });
        const res = await fetch(`/api/admin/owners/get-owners?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          // พยายามอ่านข้อความจากเซิร์ฟเวอร์มาเป็น error
          const text = await res.text().catch(() => "");
          throw new Error(text || `HTTP ${res.status}`);
        }

        const json: OwnerListResponse = await res.json();
        if (cancelled) return;

        setData(json);
        setItems(json.items ?? []);
        setTotal(json.total ?? 0);
      } catch (e: unknown) {
        if (cancelled || controller.signal.aborted) return;
        setError(toErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, limit, q]);

  return {
    data,
    items,
    total,
    page,
    limit,
    loading,
    error,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}