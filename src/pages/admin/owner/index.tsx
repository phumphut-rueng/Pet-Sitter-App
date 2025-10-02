import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SearchInput from "@/components/input/SearchInput";
import { Pagination } from "@/components/pagination/Pagination";
import OwnersTable from "@/components/admin/owners/OwnersTable";
import type { OwnerRow, OwnerListResponse } from "@/types/admin/owners";
import { cn } from "@/lib/utils/utils";

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
      <h1 className="text-xl md:text-2xl font-semibold text-ink/90">{title}</h1>
      {children}
    </div>
  );
}

export default function AdminOwnerListPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // ----- data state -----
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<OwnerRow[]>([]);
  const [total, setTotal] = useState(0);

  // ----- computed -----
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // ----- fetch list from API -----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          q: q.trim(),
        });

        const res = await fetch(`/api/admin/owners/get-owners?${params.toString()}`);
        if (!res.ok) throw new Error(await res.text());

        const data: OwnerListResponse = await res.json();
        if (!cancelled) {
          setRows(data.items ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
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
    };
  }, [page, limit, q]);

  return (
    <>
      <Head>
        <title>Admin • Pet Owner</title>
      </Head>

      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex gap-6">
          <aside className="hidden md:block md:w-[240px] shrink-0">
            <AdminSidebar sticky />
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 px-4 py-6 lg:px-6">
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

            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 md:p-5">
              {loading ? (
                <div className="py-16 text-center text-gray-500">Loading…</div>
              ) : (
                <OwnersTable rows={rows} />
              )}

              {/* footer - summary left, pagination centered */}
              <div className="mt-6 grid grid-cols-3 items-center">
                <div className="text-sm text-gray-500">
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