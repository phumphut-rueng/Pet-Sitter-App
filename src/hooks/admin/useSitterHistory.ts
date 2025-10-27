import { useState, useCallback } from "react";
import { AdminSitterService } from "@/lib/services/adminSitterService";
import type { HistoryRow } from "@/types/admin";

export function useSitterHistory(id: string | string[] | undefined) {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalRecords, setHistoryTotalRecords] = useState(0);

  const historyPerPage = 8;

  const fetchHistory = useCallback(
    async (page = 1) => {
      if (!id) return;
      
      try {
        setLoadingHistory(true);
        const resp = await AdminSitterService.getHistory({
          sitterId: Array.isArray(id) ? id[0] : id,
          page,
          limit: historyPerPage,
        });
        setHistory(resp?.data ?? []);
        setHistoryTotalPages(resp?.pagination?.totalPages ?? 1);
        setHistoryTotalRecords(resp?.pagination?.totalRecords ?? 0);
        setHistoryCurrentPage(page);
      } catch (e) {
        console.error("Error fetching history:", e);
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    },
    [id]
  );

  return {
    history,
    loadingHistory,
    historyCurrentPage,
    historyTotalPages,
    historyTotalRecords,
    historyPerPage,
    fetchHistory,
  };
}
