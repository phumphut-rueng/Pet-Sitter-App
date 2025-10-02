import { useEffect, useState } from "react";
import type { OwnerRow, OwnerListResponse } from "@/types/admin/owners";

type Params = { page?: number; limit?: number; q?: string };

export function useOwnersQuery({ page = 1, limit = 10, q = "" }: Params) {
  const [data, setData] = useState<OwnerListResponse | null>(null);
  const [items, setItems] = useState<OwnerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        const res = await fetch(`/api/admin/owners/get-owners?${params.toString()}`);
        if (!res.ok) throw new Error(await res.text());

        const json: OwnerListResponse = await res.json();
        if (cancelled) return;

        setData(json);
        setItems(json.items ?? []);
        setTotal(json.total ?? 0);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to fetch owners");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
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