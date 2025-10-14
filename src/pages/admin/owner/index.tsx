import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SearchInput from "@/components/input/SearchInput";
import { Pagination } from "@/components/pagination/Pagination";
import OwnersTable from "@/components/admin/owners/OwnersTable";
import type { OwnerRow, OwnerListResponse } from "@/types/admin/owners";
import { cn } from "@/lib/utils/utils";
import { api } from "@/lib/api/axios";
import { isAxiosError } from "axios";

function PageHeader({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-5 flex items-center justify-between gap-4", className)}>
      {/* ใช้โทเคน: Satoshi 700 / 24 / 32 / letter 0 / ink */}
      <h1 className="h3 text-ink tracking-normal">{title}</h1>
      {children}
    </div>
  );
}

export default function AdminOwnerListPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // data
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<OwnerRow[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<OwnerListResponse>(
          // baseURL = "/api" แล้ว → ไม่ใส่ /api ซ้ำ
          "admin/owners/get-owners",
          { params: { page, limit, q: q.trim() }, signal: controller.signal }
        );
        if (!cancelled) {
          setRows(data.items ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        if (isAxiosError(err) && (err.code === "ERR_CANCELED" || err.name === "CanceledError")) return;
        console.error(err);
        if (!cancelled) {
          setRows([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, limit, q]);

  return (
    <>
      <Head>
        <title>Admin • Pet Owner</title>
      </Head>

      {/* ใช้คอนเทนเนอร์กลางจาก global */}
      <div className="container-1200">
        <div className="flex gap-6">
          <aside className="hidden shrink-0 md:block md:w-[240px]">
            <AdminSidebar sticky />
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1 px-4 py-6 lg:px-6">
            <PageHeader title="Pet Owner">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                }}
              >
                <SearchInput
                  value={q}
                  onChange={setQ}
                  onSubmit={() => setPage(1)}
                  className="md:w-[260px]"
                />
              </form>
            </PageHeader>

            {/* Card ตามโทเคน: bg-card / border */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 md:p-5 shadow-[var(--shadow-sm)]">
              {loading ? (
                <div className="py-16 text-center text-muted">Loading…</div>
              ) : (
                <OwnersTable rows={rows} />
              )}

              {/* footer - summary left, pagination centered */}
              <div className="mt-6 grid grid-cols-3 items-center">
                <div className="text-sm text-muted">
                  Showing {rows.length === 0 ? 0 : (page - 1) * limit + 1}
                  –{(page - 1) * limit + rows.length} of {total}
                </div>

                <div className="flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onClick={(nextPage: number) => setPage(nextPage)}
                  />
                </div>

                <div /> {/* right spacer */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}