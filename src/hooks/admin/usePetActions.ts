import { useState, useCallback } from "react";
import { api } from "@/lib/api/axios";

export function usePetActions(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const togglePetBan = useCallback(
    async (petId: number, shouldBan: boolean) => {
      setLoading(true);
      try {
        await api.post(`admin/pets/${petId}/ban`, {
          action: shouldBan ? "ban" : "unban",
          reason: shouldBan ? "Violated policy" : undefined,
        });
        onSuccess?.();
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return { togglePetBan, loading };
}