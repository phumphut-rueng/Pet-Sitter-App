import { useState, useCallback } from "react";
import { AdminSitterService } from "@/lib/services/adminSitterService";
import type { SitterDetail } from "@/types/admin";

export function useSitterDetail(id: string | string[] | undefined) {
  const [sitter, setSitter] = useState<SitterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSitterDetail = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await AdminSitterService.getSitterById(id);
      setSitter(data);
    } catch (error) {
      console.error("Error fetching sitter detail:", error);
      setSitter(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    sitter,
    loading,
    fetchSitterDetail,
  };
}
