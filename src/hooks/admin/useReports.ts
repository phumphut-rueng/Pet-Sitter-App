import { useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/utils/error";

export type ReportStatus = "new" | "pending" | "resolved" | "rejected";

export interface Reporter {
  id: number;
  name: string | null;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
}

export interface Admin {
  id: number;
  username?: string;
  email?: string;
}

export interface Attachment {
  id: string | number;
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
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
  q?: string;
}

type ReportDetailResponse = { report: Report } | Report;

function toApiStatus(s: ReportStatus): "new" | "pending" | "resolved" | "canceled" {
  return s === "rejected" ? "canceled" : s;
}

function isWrappedReport(payload: unknown): payload is { report: Report } {
  return !!payload && typeof payload === "object" && "report" in (payload as Record<string, unknown>);
}

function extractReport(payload: ReportDetailResponse): Report {
  return isWrappedReport(payload) ? payload.report : payload;
}

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(
    async (params: UseReportsParams = {}): Promise<ReportsResponse> => {
      setLoading(true);
      setError(null);
      try {
        const { status = "all", page = 1, limit = 10, q = "" } = params;
        const query = {
          status: status === "all" ? "all" : toApiStatus(status as ReportStatus),
          page,
          limit,
          ...(q.trim() ? { q: q.trim() } : {}),
        };

        const { data } = await api.get<ReportsResponse>("/admin/reports", { params: query });
        return data;
      } catch (e) {
        const msg = getErrorMessage(e, "Failed to load reports");
        setError(msg);
        toast.error(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchReportDetail = useCallback(
    async (reportId: number): Promise<Report> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<ReportDetailResponse>(`/admin/reports/${reportId}`);
        return extractReport(data);
      } catch (e) {
        const msg = getErrorMessage(e, "Failed to load report detail");
        setError(msg);
        toast.error(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateReportStatus = useCallback(
    async (reportId: number, status: ReportStatus, adminNote?: string) => {
      setLoading(true);
      setError(null);
      try {
        const next = toApiStatus(status);
        await api.patch(`/admin/reports/${reportId}`, { status: next, adminNote });

        const labels: Record<ReportStatus, string> = {
          new: "New",
          pending: "Pending",
          resolved: "Resolved",
          rejected: "Rejected",
        };
        toast.success(`Report marked as ${labels[status]}`);
      } catch (e) {
        const msg = getErrorMessage(e, "Failed to update report status");
        setError(msg);
        toast.error(msg);
        throw e;
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