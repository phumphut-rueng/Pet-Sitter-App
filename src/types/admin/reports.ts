// src/types/admin/reports.ts

//  ใช้สถานะตาม DB/Backend
export type ReportStatus = "new" | "pending" | "resolved" | "canceled";

// สถานะสำหรับ UI (StatusBadge)
export type ReportStatusUI = "newReport" | "pending" | "resolved" | "canceled";

export interface Reporter {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string | null;
}

export interface ReportedUser {
  id: number;
  name: string;
  email: string;
  profileImage?: string | null;
}

export interface Admin {
  id: number;
  userId: number;
  name: string;
  email: string;
  profileImage?: string | null;
}

export interface Report {
  id: number;
  title: string;
  description?: string;
  status: ReportStatus;
  reporter: Reporter;
  reportedUser?: ReportedUser | null;
  handledBy?: Admin | null;
  attachments?: unknown;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportRow {
  id: number;
  reporterName: string;
  reportedPersonName?: string;
  issue: string;
  dateSubmitted: string;
  status: ReportStatusUI; // ใช้ UI status
}

export interface ReportsListParams {
  status?: ReportStatus | "all";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  q?: string;
}

export interface ReportsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReportsResponse {
  reports: Report[];
  pagination: ReportsPagination;
}

export interface UpdateReportStatusRequest {
  status: ReportStatus;
  adminNote?: string;
}

export interface UpdateReportStatusResponse {
  message: string;
  report: Report;
}

//  Helper: Database Status → UI Status
export function toUIStatus(dbStatus: ReportStatus): ReportStatusUI {
  if (dbStatus === "new") return "newReport";
  return dbStatus;
}

//  Helper: UI Status Database Status
export function toDBStatus(uiStatus: ReportStatusUI | "all"): ReportStatus | "all" {
  if (uiStatus === "newReport") return "new";
  return uiStatus as ReportStatus | "all";
}

//  Helper: แปลง Report  ReportRow
export function toReportRow(r: Report): ReportRow {
  return {
    id: r.id,
    reporterName: r.reporter.name,
    reportedPersonName: r.reportedUser?.name ?? "-",
    issue: r.title,
    dateSubmitted: r.createdAt,
    status: toUIStatus(r.status), 
  };
}