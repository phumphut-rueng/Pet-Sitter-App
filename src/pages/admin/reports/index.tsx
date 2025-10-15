import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/admin/owners/PageHeader";
import ReportsTable from "@/components/admin/reports/ReportsTable";
import StatusFilter from "@/components/admin/reports/StatusFilter";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { Pagination } from "@/components/pagination/Pagination";

import { api } from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/api/api-utils";
import type { ReportsResponse, ReportRow, ReportStatusUI } from "@/types/admin/reports";
import { toReportRow, toDBStatus } from "@/types/admin/reports";

const LIMIT = 10;

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by title, description, reporter name/email"
      className="mb-4 w-full rounded-lg border border-gray-2 bg-white px-3 py-2 text-sm2-medium focus:outline-none focus:ring-2 focus:ring-brand md:w-96"
      aria-label="Search reports"
    />
  );
}

export default function ReportsListPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatusUI | "all">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<ReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

  useEffect(() => {
    let alive = true;

    async function fetchReports() {
      setLoading(true);

      const params = {
        status: toDBStatus(statusFilter),
        q: q.trim(),
        page,
        limit: LIMIT,
        sortBy: "created_at" as const,
        sortOrder: "desc" as const,
      };

      try {
        const { data } = await api.get<ReportsResponse>("/admin/reports", { params });
        if (!alive) return;

        setRows((data.reports ?? []).map(toReportRow));
        setTotal(data.pagination.total);
      } catch (err) {
        if (!alive) return;

        const msg = getErrorMessage(err, "Failed to load reports");
        toast.error(msg);
        setRows([]);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchReports();
    return () => { alive = false; };
  }, [statusFilter, q, page]);

  const from = rows.length === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = (page - 1) * LIMIT + rows.length;

  return (
    <AdminLayout>
      <div className="relative min-h-[600px]">
        <div className="mb-6 flex items-center justify-between">
          <PageHeader title="Report" className="mb-0" />
          <StatusFilter 
            value={statusFilter} 
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }} 
          />
        </div>

        <SearchBar 
          value={q} 
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }} 
        />

        <div className="relative rounded-2xl border border-gray-2 bg-white p-4 shadow-sm md:p-5">
          <ReportsTable reports={rows} />

          <div className="mt-6 grid grid-cols-3 items-center">
            <div className="text-xs2-regular text-muted">
              Showing {from}–{to} of {total}
            </div>

            <div className="flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onClick={setPage} />
            </div>

            <div />
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl ">
              <PetPawLoading message="Loading Reports..." size="md" />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}