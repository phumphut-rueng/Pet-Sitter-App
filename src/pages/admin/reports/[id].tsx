import * as React from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/layout/AdminLayout";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { api } from "@/lib/api/axios";
import type { Report, ReportStatus } from "@/types/admin/reports";
import { toUIStatus } from "@/types/admin/reports";
import { getErrorMessage } from "@/lib/api/api-utils"; 

// Component สำหรับแสดงข้อมูล
function Field({
  label,
  value,
  showDivider = false,
}: {
  label: string;
  value: string;
  showDivider?: boolean;
}) {
  return (
    <div className="pb-6">
      {/* Label */}
      <div className="h4-bold text-gray-5 mb-2">{label}</div>
      {/* Value */}
      <div className="body1-regular text-ink">{value}</div>
      {/* เส้นใต้ (อยู่ใต้ Value) */}
      {showDivider && <div className="w-full h-[1px] bg-gray-2 mt-4" />}
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ReportDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [report, setReport] = React.useState<Report | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [openResolve, setOpenResolve] = React.useState(false);
  const [openCancel, setOpenCancel] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    const run = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data } = await api.get<{ report: Report }>(`/admin/reports/${id}`);
        setReport(data.report);
      } catch (err: unknown) {
        const msg = getErrorMessage(err, "Failed to fetch report");
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [id]);

  const updateStatus = async (next: ReportStatus) => {
    if (!report) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/reports/${report.id}`, { status: next });
      setReport({ ...report, status: next });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to update report");
      setErrorMsg(msg);
    } finally {
      setActionLoading(false);
      setOpenResolve(false);
      setOpenCancel(false);
    }
  };

  //  Loading State with PetPawLoading
  if (loading) {
    return (
      <AdminLayout>
        <PetPawLoading message="Loading Report Details" size="md" />
      </AdminLayout>
    );
  }

  if (errorMsg) {
    return (
      <AdminLayout>
        <div className="bg-red-1 border border-red-3 text-red-5 px-4 py-3 rounded-lg body1-medium">
          {errorMsg}
        </div>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout>
        <div className="body1-regular text-gray-6">Report not found</div>
      </AdminLayout>
    );
  }

  const showActions = report.status === "new" || report.status === "pending";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-6 hover:text-ink body1-medium"
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="h3-bold text-ink">{report.title}</h1>
          <StatusBadge status={toUIStatus(report.status)} />
        </div>

        {showActions && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenCancel(true)}
              className="px-6 py-3 rounded-xl body1-medium text-orange-5 hover:bg-orange-1 transition-colors"
            >
              Cancel Report
            </button>
            <button
              onClick={() => setOpenResolve(true)}
              className="px-6 py-3 rounded-xl body1-medium bg-orange-5 text-white hover:bg-orange-6 transition-colors"
            >
              Resolve
            </button>
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl border border-gray-2 p-10 space-y-0">
        {/* Reported by - มีเส้นใต้ */}
        <Field
          label="Reported by"
          value={`${report.reporter.name} (${report.reporter.email})`}
          showDivider={true}
        />

        {/* ฟิลด์อื่นๆ - ไม่มีเส้นใต้ */}
        {report.reportedUser && (
          <Field
            label="Reported Person"
            value={`${report.reportedUser.name} (${report.reportedUser.email})`}
          />
        )}

        <Field label="Issue" value={report.title} />

        <Field label="Description" value={report.description || "-"} />

        <Field label="Date Submitted" value={formatDate(report.createdAt)} />

        <Field
          label="Date Updated"
          value={formatDate(report.updatedAt || report.createdAt)}
        />
      </div>

      <ConfirmDialog
        open={openResolve}
        onOpenChange={setOpenResolve}
        loading={actionLoading}
        title="Resolve report?"
        description="This will mark the report as resolved."
        confirmLabel="Resolve"
        cancelLabel="Back"
        onConfirm={() => updateStatus("resolved")}
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
        onConfirm={() => updateStatus("canceled" as ReportStatus)} 
      />
    </AdminLayout>
  );
}