import { useState, useCallback } from "react";
import { toast } from "sonner";

/** Domain types */
export type ReportStatus = "new" | "pending" | "resolved" | "rejected";

export interface Reporter {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string | null;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
}


export interface Attachment {
  id: string | number;
  url: string;
  name?: string;
  mimeType?: string;
  size?: number; // bytes
  width?: number;
  height?: number;
}


export interface Report {
  id: number;
  title: string;
  description?: string | null;
  status: ReportStatus;
  reporter: Reporter;
  handledBy?: Admin | null;
  attachments?: Attachment[];   
  adminNote?: string | null;
  createdAt: string;          
  updatedAt?: string | null;    
}

export interface ReportsResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UseReportsParams {
  status?: ReportStatus | "all";
  page?: number;
  limit?: number;
  /** ถ้าต้องการรองรับค้นหา */
  q?: string;
}

/** ช่วย parse JSON แบบ type-safe */
async function parseJson<T>(resp: Response): Promise<T> {
  return (await resp.json()) as T;
}

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Reports List
  const fetchReports = useCallback(
    async (params: UseReportsParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          status: params.status ?? "all",
          page: String(params.page ?? 1),
          limit: String(params.limit ?? 10),
        });

        if (params.q && params.q.trim()) {
          queryParams.set("q", params.q.trim());
        }

        const response = await fetch(`/api/admin/reports?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await parseJson<ReportsResponse>(response);
        return data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        toast.error("Failed to load reports");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  //  Fetch Single Report Detail
  const fetchReportDetail = useCallback(async (reportId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Report not found");
        }
        throw new Error("Failed to fetch report detail");
      }

      const data = await parseJson<Report>(response);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✏️ Update Report Status
  interface UpdateReportStatusResponse {
    success: true;
    report: Report;
  }

  const updateReportStatus = useCallback(
    async (reportId: number, status: ReportStatus, adminNote?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/reports/${reportId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, adminNote }),
        });

        if (!response.ok) {
          throw new Error("Failed to update report status");
        }

        const data = await parseJson<UpdateReportStatusResponse>(response);

        const statusLabels: Record<ReportStatus, string> = {
          new: "New",
          pending: "Pending",
          resolved: "Resolved",
          rejected: "Rejected",
        };
        toast.success(`Report marked as ${statusLabels[status]}`);

        return data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    fetchReports,
    fetchReportDetail,
    updateReportStatus,
  };
}