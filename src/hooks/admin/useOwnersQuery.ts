import { useEffect, useMemo, useState } from "react";
import type { OwnerRow, OwnerListResponse } from "@/types/admin/owners";
import { api } from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/utils/error";

type StatusFilter = "all" | "normal" | "ban";
type Params = { page?: number; limit?: number; q?: string; status?: StatusFilter };

export function useOwnersQuery({
  page = 1,
  limit = 10,
  q = "",
  status = "all",
}: Params) {
  const [items, setItems] = useState<OwnerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string | number> = { page, limit };
    const trimmed = q.trim();
    if (trimmed) p.q = trimmed;
    if (status !== "all") p.status = status;
    return p;
  }, [page, limit, q, status]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<OwnerListResponse>("admin/owners/get-owners", {
          params,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch (e) {
        if (controller.signal.aborted) return;
        
        setItems([]);
        setTotal(0);
        setError(getErrorMessage(e, "Failed to load owners"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [params]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  return {
    items,
    total,
    page,
    limit,
    loading,
    error,
    totalPages,
  };
}