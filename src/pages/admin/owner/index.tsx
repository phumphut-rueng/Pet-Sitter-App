import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import toast from "react-hot-toast";

import AdminSidebar from "@/components/layout/AdminSidebar";
import SearchInput from "@/components/input/SearchInput";
import { Pagination } from "@/components/pagination/Pagination";
import OwnersTable from "@/components/admin/owners/OwnersTable";
import { PetPawLoading } from "@/components/loading/PetPawLoading";

import type { OwnerRow, OwnerListResponse } from "@/types/admin/owners";
import { api } from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/utils/error";

const LIMIT = 10;

function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h1 className="h3 text-ink tracking-normal">{title}</h1>
      {children}
    </div>
  );
}

export default function AdminOwnerListPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<OwnerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

  useEffect(() => {
    let alive = true;

    async function fetchOwners() {
      setLoading(true);
      try {
        const { data } = await api.get<OwnerListResponse>("admin/owners/get-owners", {
          params: { page, limit: LIMIT, q: q.trim() },
        });
        if (!alive) return;
        
        setRows(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        if (!alive) return;
        
        setRows([]);
        setTotal(0);
        toast.error(getErrorMessage(err, "Failed to load pet owners"));
        console.error("Load owners failed:", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchOwners();
    return () => { alive = false; };
  }, [page, q]);

  const from = rows.length === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = (page - 1) * LIMIT + rows.length;

  return (
    <>
      <Head>
        <title>Admin • Pet Owner</title>
      </Head>

      <div className="flex min-h-screen w-full">
        <aside className="hidden shrink-0 md:block md:w-[240px]">
          <AdminSidebar sticky />
        </aside>

        <main className="flex-1 px-6 py-6 lg:px-8">
          <PageHeader title="Pet Owner">
            <SearchInput
              value={q}
              onChange={setQ}
              onSubmit={() => setPage(1)}
              className="md:w-[260px]"
            />
          </PageHeader>

          <div className="relative min-h-[400px] rounded-2xl border border-gray-2 bg-white p-4 shadow-sm md:p-5">
            <OwnersTable rows={rows} />

            <div className="mt-6 grid grid-cols-3 items-center">
              <div className="text-xs2-regular text-muted">
                Showing {from}–{to} of {total}
              </div>

              <div className="flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onClick={setPage}
                />
              </div>

              <div />
            </div>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60">
                <PetPawLoading message="Loading Pet Owners..." size="md" />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}