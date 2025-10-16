import { useState, useCallback } from "react";
import { api } from "@/lib/api/axios";
import { isAxiosError } from "axios";

function getErrorMessage(error: unknown, fallback = "An error occurred"): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string };
    return data?.message || data?.error || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}

type UseOwnerActionsReturn = {
  banOwner: (reason?: string, cascadePets?: boolean) => Promise<void>;
  unbanOwner: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

export function useOwnerActions(ownerId?: string, onSuccess?: () => void): UseOwnerActionsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const banOwner = useCallback(
    async (reason?: string, cascadePets = false) => {
      if (!ownerId) return;
      
      setLoading(true);
      setError(null);

      try {
        await api.post(`admin/owners/${ownerId}/ban`, {
          action: "ban",
          reason: reason || "Violated policy",
          cascadePets,
        });
        
        onSuccess?.();
      } catch (err) {
        const msg = getErrorMessage(err, "Failed to ban owner");
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ownerId, onSuccess]
  );

  const unbanOwner = useCallback(async () => {
    if (!ownerId) return;
    
    setLoading(true);
    setError(null);

    try {
      await api.post(`admin/owners/${ownerId}/ban`, {
        action: "unban",
      });
      
      onSuccess?.();
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to unban owner");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ownerId, onSuccess]);

  return {
    banOwner,
    unbanOwner,
    loading,
    error,
  };
}