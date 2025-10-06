import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminSidebar from "@/components/layout/AdminSidebar";
import OwnerHeader from "@/components/admin/owners/OwnerHeader";
import OwnerProfileCard from "@/components/admin/owners/OwnerProfileCard";
import OwnerPetsList from "@/components/admin/owners/OwnerPetsList";
import BanConfirm from "@/components/admin/owners/BanConfirm";
import { useOwnerDetail } from "@/hooks/admin/useOwnerDetail";
import toast from "react-hot-toast";

export default function OwnerDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  // ✅ ดึง refetch + isSuspended จาก hook เวอร์ชันล่าสุด
  const { loading, error, owner, tab, setTab, refetch, isSuspended } = useOwnerDetail(id);

  // Dialog (confirm)
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [mode, setMode] = React.useState<"ban" | "unban">("ban");

  async function handleBanUnban() {
    if (!id) return;
    setDialogLoading(true);
    try {
      const res = await fetch(`/api/admin/owners/${id}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ถ้า backend ยังต้องใช้ใน dev: ใส่ x-user-id เป็น user_id ที่เป็น admin
          // "x-user-id": "1",
        },
        body: JSON.stringify({
          action: mode,                             // "ban" | "unban"
          reason: mode === "ban" ? "Violated policy" : undefined,
          cascadePets: mode === "ban",
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      // ปิด dialog + toast
      setDialogOpen(false);
      toast.success(mode === "ban" ? "User banned" : "User unbanned");

      // ✅ โหลดข้อมูลใหม่จากเซิร์ฟเวอร์ให้ status/ข้อมูลตรงกัน
      await refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    } finally {
      setDialogLoading(false);
    }
  }

  return (
    <>
      <Head><title>Admin • Owner Detail</title></Head>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex gap-6">
          <aside className="hidden md:block md:w-[240px] shrink-0">
            <AdminSidebar sticky />
          </aside>

          <main className="flex-1 min-w-0 px-4 py-6 lg:px-6">
            <button onClick={() => router.back()} className="mb-4 text-gray-600 hover:underline">
              ← Back
            </button>

            {loading && <div className="py-16 text-center text-gray-500">Loading…</div>}
            {!loading && error && <div className="py-16 text-center text-red-600">{error}</div>}
            {!loading && !error && !owner && <div className="py-16 text-center text-gray-500">Not found</div>}

            {!loading && owner && (
              <section>
                <OwnerHeader
                  title={owner.name || owner.email}
                  tab={tab}
                  onTabChange={setTab}
                  owner={owner}   // ✅ โชว์ avatar + status badge บนหัวข้อ
                />

                {tab === "profile" && (
                  <OwnerProfileCard
                    owner={owner}
                    isSuspended={isSuspended}   // ✅ ใช้จาก hook
                    onClickBan={() => {
                      setMode(isSuspended ? "unban" : "ban");
                      setDialogOpen(true);
                    }}
                  />
                )}

                {tab === "pets" && <OwnerPetsList pets={owner.pets} />}

                {tab === "reviews" && (
                  <div className="px-10 pb-10 pt-6 text-gray-500">No reviews.</div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>

      <BanConfirm
        open={dialogOpen}
        loading={dialogLoading}
        mode={mode}
        onOpenChange={setDialogOpen}
        onConfirm={handleBanUnban}
      />
    </>
  );
}