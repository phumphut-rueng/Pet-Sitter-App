import * as React from "react";
import { api } from "@/lib/api/axios";
import { isAxiosError, CanceledError } from "axios";
import type { OwnerDetail } from "@/types/admin/owners";

export type Tab = "profile" | "pets" | "reviews";

type UseOwnerDetailReturn = {
  loading: boolean;
  error: string | null;
  owner: OwnerDetail | null;
  tab: Tab;
  setTab: (t: Tab) => void;
  refetch: () => void;
};

function isCanceled(error: unknown): boolean {
  return (
    error instanceof CanceledError ||
    (isAxiosError(error) && error.code === "ERR_CANCELED")
  );
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string };
    return data?.message || data?.error || error.message || "Failed to load";
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Failed to load";
}

export function useOwnerDetail(id?: string): UseOwnerDetailReturn {
  const [owner, setOwner] = React.useState<OwnerDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<Tab>("profile");
  const [refetchKey, setRefetchKey] = React.useState(0);

  React.useEffect(() => {
    if (!id) {
      setOwner(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    
    const fetchOwner = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await api.get<OwnerDetail>("admin/owners/get-owner-by-id", {
          params: { id },
          signal: controller.signal,
        });
        
        if (!controller.signal.aborted) {
          setOwner(data);
        }
      } catch (err) {
        if (!isCanceled(err) && !controller.signal.aborted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOwner();

    return () => controller.abort();
  }, [id, refetchKey]);

  const refetch = React.useCallback(() => {
    setRefetchKey(prev => prev + 1);
  }, []);

  return {
    loading,
    error,
    owner,
    tab,
    setTab,
    refetch,
  };
}