import * as React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/admin/owners/PageHeader";
import ReportsTable from "@/components/admin/reports/ReportsTable";
import StatusFilter from "@/components/admin/reports/StatusFilter";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { api } from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/api/api-utils";
import type { ReportsResponse, ReportRow, ReportStatusUI } from "@/types/admin/reports";
import { toReportRow, toDBStatus } from "@/types/admin/reports";

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mb-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full md:w-96 rounded-lg border border-gray-2 px-3 py-2 text-sm2-medium
                   focus:outline-none focus:ring-2 focus:ring-brand"
        aria-label="Search reports"
      />
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="bg-red-1 border border-red-3 text-red-5 px-4 py-3 rounded-lg mb-4 text-sm2-medium">
      {message}
    </div>
  );
}

function PaginationBar({
  page,
  total,
  totalPages,
  limit,
  loading,
  onPageChange,
}: {
  page: number;
  total: number;
  totalPages: number;
  limit: number;
  loading: boolean;
  onPageChange: (next: number) => void;
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-2">
      <p className="text-sm2-regular text-gray-6">
        Showing {start} to {end} of {total} results
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
          className="px-4 py-2 rounded-lg text-sm2-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-1 text-gray-6 hover:bg-gray-2"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || loading}
          className="px-4 py-2 rounded-lg text-sm2-medium transition-all 
                    disabled:opacity-50 disabled:cursor-not-allowed bg-gray-1 text-gray-6 hover:bg-gray-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function ReportsListPage() {
  // filters & query
  const [statusFilter, setStatusFilter] = React.useState<ReportStatusUI | "all">("all");
  const [q, setQ] = React.useState("");

  // pagination
  const [page, setPage] = React.useState(1);
  const limit = 10;

  // data state
  const [rows, setRows] = React.useState<ReportRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  // ui state
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const params = React.useMemo(
    () => ({
      status: toDBStatus(statusFilter),
      q,
      page,
      limit,
      sortBy: "created_at" as const,
      sortOrder: "desc" as const,
    }),
    [statusFilter, q, page]
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data } = await api.get<ReportsResponse>("/admin/reports", { params });
      setRows((data.reports ?? []).map(toReportRow));
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "Failed to load reports"));
    } finally {
      setLoading(false);
    }
  }, [params]);

  // load on first mount + whenever params change
  React.useEffect(() => {
    void load();
  }, [load]);

  // reset page when filter or query changes
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, q]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Report" className="mb-0" />
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* Search */}
      <SearchBar
        value={q}
        onChange={setQ}
        placeholder="Search by title, description, reporter name/email"
      />

      {/*  Loading State with PetPawLoading */}
      {loading && <PetPawLoading message="Loading Reports" size="md" />}
      
      {errorMsg && <ErrorAlert message={errorMsg} />}

      {/* Table - แสดงเฉพาะตอนไม่ loading */}
      {!loading && <ReportsTable reports={rows} />}

      {/* Pagination */}
      {!loading && (
        <PaginationBar
          page={page}
          total={total}
          totalPages={totalPages}
          limit={limit}
          loading={loading}
          onPageChange={setPage}
        />
      )}
    </AdminLayout>
  );
}