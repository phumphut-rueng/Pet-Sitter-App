import { useEffect, useState } from "react";
import type { OwnerRow, OwnerListResponse } from "@/types/admin/owners";
import { api } from "@/lib/api/axios";
import { isAxiosError } from "axios";

type StatusFilter = "all" | "normal" | "ban";
type Params = { page?: number; limit?: number; q?: string; status?: StatusFilter };

type ApiErrorPayload = { message?: string; error?: string };

function toErrorMessage(e: unknown): string {
  if (isAxiosError(e)) {
    const d = e.response?.data as unknown as ApiErrorPayload | undefined;
    return d?.error || d?.message || e.message || "Failed to load owners";
  }
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Failed to load owners";
  }
}

export function useOwnersQuery({ page = 1, limit = 10, q = "", status = "all" }: Params) {
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
        // ส่ง status ไปเฉพาะเมื่อไม่ใช่ "all"
        const statusParam = status === "all" ? undefined : status;

        const { data } = await api.get<OwnerListResponse>("/api/admin/owners/get-owners", {
          params: {
            page,
            limit,
            q: q.trim(),
            ...(statusParam ? { status: statusParam } : {}), // ส่งเฉพาะที่ต้องส่ง
          },
          signal: controller.signal,
        });

        if (cancelled) return;

        setData(data);
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch (e) {
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
  }, [page, limit, q, status]);

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