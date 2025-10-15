import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import AdminLayout from "@/components/layout/AdminLayout";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { api } from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/api/api-utils";
import { formatToddMMyyyy } from "@/lib/utils/date";

import type { Report, ReportStatus } from "@/types/admin/reports";
import { toUIStatus } from "@/types/admin/reports";

function Field({ label, value, showDivider = false }: { 
  label: string; 
  value: string; 
  showDivider?: boolean;
}) {
  return (
    <div className="pb-6">
      <div className="h4-bold mb-2 text-gray-5">{label}</div>
      <div className="body1-regular text-ink">{value}</div>
      {showDivider && <div className="mt-4 h-px w-full bg-gray-2" />}
    </div>
  );
}

export default function ReportDetailPage() {
  const router = useRouter();
  const reportId = typeof router.query.id === "string" ? router.query.id : undefined;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState<"resolve" | "cancel" | null>(null);
  const [openResolve, setOpenResolve] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  // โหลดข้อมูล
  useEffect(() => {
    if (!reportId) return;

    let alive = true;

    async function fetchReport() {
      setLoading(true);
      try {
        const { data } = await api.get<{ report: Report }>(`/admin/reports/${reportId}`);
        if (!alive) return;
        setReport(data.report);
      } catch (err) {
        if (!alive) return;
        const msg = getErrorMessage(err, "Failed to fetch report");
        toast.error(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchReport();
    return () => { alive = false; };
  }, [reportId]);

  // อัปเดตสถานะ
  async function updateStatus(status: ReportStatus, type: "resolve" | "cancel") {
    if (!report) return;

    setActionLoading(true);
    setActionType(type);

    const loadingToast = toast.loading(
      type === "resolve" ? "Resolving report..." : "Canceling report..."
    );

    try {
      await api.patch(`/admin/reports/${report.id}`, { status });
      setReport({ ...report, status });

      toast.success(
        type === "resolve" ? "Report resolved successfully" : "Report canceled successfully",
        { id: loadingToast }
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update report"), { id: loadingToast });
    } finally {
      setActionLoading(false);
      setActionType(null);
      setOpenResolve(false);
      setOpenCancel(false);
    }
  }

  const canTakeAction = report && (report.status === "new" || report.status === "pending");

  // กำลังโหลด
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[600px] items-center justify-center">
          <PetPawLoading message="Loading Report Details..." size="md" />
        </div>
      </AdminLayout>
    );
  }

  // ไม่เจอ report
  if (!report) {
    return (
      <AdminLayout>
        <div className="body1-regular text-gray-6">Report not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="relative min-h-[600px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="body1-medium text-gray-6 hover:text-ink"
              aria-label="Go back"
            >
              ←
            </button>
            <h1 className="h3-bold text-ink">{report.title}</h1>
            <StatusBadge status={toUIStatus(report.status)} />
          </div>

          {canTakeAction && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpenCancel(true)}
                className="body1-medium rounded-xl px-6 py-3 text-orange-5 transition-colors hover:bg-orange-1"
              >
                Cancel Report
              </button>
              <button
                onClick={() => setOpenResolve(true)}
                className="body1-medium rounded-xl bg-orange-5 px-6 py-3 text-white transition-colors hover:bg-orange-6"
              >
                Resolve
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-0 rounded-2xl border border-gray-2 bg-white p-10">
          <Field
            label="Reported by"
            value={`${report.reporter.name} (${report.reporter.email})`}
            showDivider
          />

          {report.reportedUser && (
            <Field
              label="Reported Person"
              value={`${report.reportedUser.name} (${report.reportedUser.email})`}
            />
          )}

          <Field label="Issue" value={report.title} />
          <Field label="Description" value={report.description || "-"} />
          <Field label="Date Submitted" value={formatToddMMyyyy(report.createdAt)} />
          <Field
            label="Date Updated"
            value={formatToddMMyyyy(report.updatedAt || report.createdAt)}
          />
        </div>

        {/* Action Loading overlay */}
        {actionLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
            <PetPawLoading
              message={actionType === "resolve" ? "Resolving Report..." : "Canceling Report..."}
              size="md"
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={openResolve}
        onOpenChange={setOpenResolve}
        loading={actionLoading}
        title="Resolve report?"
        description="This will mark the report as resolved."
        confirmLabel="Resolve"
        cancelLabel="Back"
        onConfirm={() => updateStatus("resolved", "resolve")}
      />

      <ConfirmDialog
        open={openCancel}
        onOpenChange={setOpenCancel}
        loading={actionLoading}
        title="Cancel report?"
        description="This will cancel the report."
        confirmLabel="Cancel Report"
        cancelLabel="Back"
        variant="danger"
        onConfirm={() => updateStatus("canceled", "cancel")}
      />
    </AdminLayout>
  );
}