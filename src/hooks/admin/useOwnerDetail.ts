import * as React from "react";
import type { OwnerDetail } from "@/types/admin/owners";
import { api } from "@/lib/api/axios";
import { isAxiosError, CanceledError } from "axios";

export type Tab = "profile" | "pets" | "reviews";

type UseOwnerDetailOpts = {
  onError?: (msg: string) => void;
};

type UseOwnerDetailReturn = {
  loading: boolean;
  error: string | null;
  owner: OwnerDetail | null;
  setOwner: React.Dispatch<React.SetStateAction<OwnerDetail | null>>;
  tab: Tab;
  setTab: (t: Tab) => void;
  refetch: () => Promise<void>;
  isBanned: boolean;
  banOwner: (reason?: string, cascadePets?: boolean) => Promise<void>;
  unbanOwner: () => Promise<void>;
};

type AbortLike = { name?: unknown };
function isAbortErrorLike(e: unknown): boolean {
  return typeof (e as AbortLike)?.name === "string" && (e as { name: string }).name === "AbortError";
}

type ApiErrorPayload = { message?: string; error?: string };

function isCanceled(e: unknown, signal?: AbortSignal): boolean {
  return (
    e instanceof CanceledError ||
    (isAxiosError(e) && e.code === "ERR_CANCELED") ||
    (signal?.aborted ?? false) ||
    isAbortErrorLike(e)
  );
}

function getAxiosMessage(e: unknown, fallback = "Failed to load"): string {
  if (isAxiosError(e)) {
    if (!e.response) return "Network error. Please check your connection.";
    const data = e.response.data as unknown as ApiErrorPayload | undefined;
    return data?.message || data?.error || e.response.statusText || e.message || fallback;
  }
  if (e instanceof Error) return e.message || fallback;
  if (typeof e === "string") return e || fallback;
  return fallback;
}

export function useOwnerDetail(
  id?: string,
  initialData?: OwnerDetail | null,
  opts?: UseOwnerDetailOpts
): UseOwnerDetailReturn {
  const [owner, setOwner] = React.useState<OwnerDetail | null>(initialData ?? null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<Tab>("profile");
  const [refetchTrigger, setRefetchTrigger] = React.useState(0);

  const controllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (!id) {
      controllerRef.current?.abort();
      setOwner(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data } = await api.get<OwnerDetail>("admin/owners/get-owner-by-id", {
          params: { id },
          signal: controller.signal,
        });
        
        if (!controller.signal.aborted) {
          setOwner(data);
        }
      } catch (e) {
        if (isCanceled(e, controller.signal)) return;
        
        const msg = getAxiosMessage(e, "Failed to load owner details");
        setError(msg);
        opts?.onError?.(msg);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [id, refetchTrigger, opts]);

  const isBanned = React.useMemo(() => {
    const statusIsBanned = owner?.status === "ban";
    const hasBanTimestamp = Boolean(owner?.banned_at ?? owner?.suspended_at);
    return statusIsBanned || hasBanTimestamp;
  }, [owner?.status, owner?.banned_at, owner?.suspended_at]);

  const refetch = React.useCallback(async () => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  const banOwner = React.useCallback(
    async (reason?: string, cascadePets = true) => {
      if (!id) return;
      try {
        await api.post(`admin/owners/${id}/ban`, {
          action: "ban",
          reason: reason ?? "Violated policy",
          cascadePets,
        });
        await refetch();
      } catch (e) {
        const msg = getAxiosMessage(e, "Failed to ban owner");
        setError(msg);
        opts?.onError?.(msg);
      }
    },
    [id, refetch, opts]
  );

  const unbanOwner = React.useCallback(async () => {
    if (!id) return;
    try {
      await api.post(`admin/owners/${id}/ban`, { action: "unban" });
      await refetch();
    } catch (e) {
      const msg = getAxiosMessage(e, "Failed to unban owner");
      setError(msg);
      opts?.onError?.(msg);
    }
  }, [id, refetch, opts]);

  return {
    loading,
    error,
    owner,
    setOwner,
    tab,
    setTab,
    refetch,
    isBanned,
    banOwner,
    unbanOwner,
  };
}