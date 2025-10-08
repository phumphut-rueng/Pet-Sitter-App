import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminSidebar from "@/components/layout/AdminSidebar";
import OwnerHeader from "@/components/admin/owners/OwnerHeader";
import OwnerProfileCard from "@/components/admin/owners/OwnerProfileCard";
import OwnerPetsList from "@/components/admin/owners/OwnerPetsList";
import PetDetailModal from "@/components/admin/owners/PetDetailModal";
import BanConfirm from "@/components/admin/owners/BanConfirm";
import { useOwnerDetail } from "@/hooks/admin/useOwnerDetail";
import toast from "react-hot-toast";
import { api } from "@/lib/api/axios"; // 🔹 axios instance
import { isAxiosError } from "axios";
import type { PetItem } from "@/types/admin/owners";

/**
 *  หน้ารายละเอียด Owner สำหรับ Admin
 * 
 * ใช้ axios เรียก API ทั้งหมด:
 * - โหลดข้อมูล owner ด้วย axios.get() ผ่าน useOwnerDetail
 * - แบน/ปลดแบน owner ด้วย axios.post()
 * - แบน/ปลดแบน pet ด้วย axios.post()
 */
export default function OwnerDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  /**
   * useOwnerDetail hook
   * - โหลดข้อมูล owner ด้วย axios.get()
   * - refetch = ฟังก์ชันโหลดข้อมูลใหม่ด้วย axios.get()
   * 
   * หมายเหตุ: "refetch" เป็นแค่ชื่อฟังก์ชัน ไม่ใช่ fetch API
   * ภายในใช้ axios.get() ทั้งหมด
   */
  const { loading, error, owner, tab, setTab, refetch, isSuspended } = useOwnerDetail(id);

  // Dialog states สำหรับยืนยันการ ban/unban Owner
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [mode, setMode] = React.useState<"ban" | "unban">("ban");

  // Modal states สำหรับแสดงรายละเอียด Pet
  const [selectedPet, setSelectedPet] = React.useState<PetItem | null>(null);
  const [petModalOpen, setPetModalOpen] = React.useState(false);

  /**
   *  Helper: แปลง axios error เป็นข้อความที่อ่านง่าย
   * (type-safe ไม่ใช้ any)
   */
  type AxiosErrorPayload = { message?: string; error?: string };
  const toErrMsg = (e: unknown, fallback = "Action failed") => {
    if (isAxiosError(e)) {
      const d = e.response?.data as AxiosErrorPayload | undefined;
      return d?.message || d?.error || e.message || fallback;
    }
    if (e instanceof Error) return e.message || fallback;
    if (typeof e === "string") return e || fallback;
    return fallback;
  };

  /**
   *  handleBanUnban: แบน/ปลดแบน Owner
   * ใช้ axios.post() ส่งคำสั่งไปที่ API
   */
  async function handleBanUnban() {
    if (!id) return;
    setDialogLoading(true);
    try {
      // ใช้ axios.post() ส่งคำสั่ง ban/unban
      await api.post(`admin/owners/${id}/ban`, {
        action: mode,
        reason: mode === "ban" ? "Violated policy" : undefined,
        cascadePets: mode === "ban", // แบน pets ที่เกี่ยวข้องด้วย
      });
      
      setDialogOpen(false);
      toast.success(mode === "ban" ? "User banned" : "User unbanned");
      
      // โหลดข้อมูลใหม่ด้วย axios.get() ผ่าน refetch()
      // หมายเหตุ: refetch ใช้ axios.get() ไม่ใช่ fetch API
      await refetch();
    } catch (err) {
      toast.error(toErrMsg(err));
    } finally {
      setDialogLoading(false);
    }
  }

  /**
   * handlePetToggleSuspend: แบน/ปลดแบน Pet
   * ใช้ axios.post() ส่งคำสั่งไปที่ API
   */
  async function handlePetToggleSuspend(petId: number, shouldBan: boolean) {
    try {
      // ใช้ axios.post() ส่งคำสั่ง ban/unban pet
      await api.post(`admin/pets/${petId}/ban`, {
        action: shouldBan ? "ban" : "unban",
      });
      
      // โหลดข้อมูลใหม่ด้วย axios.get() ผ่าน refetch()
      await refetch();
      
      toast.success(shouldBan ? "Pet suspended" : "Pet unsuspended");
      setPetModalOpen(false);
    } catch (err) {
      console.error("Failed to update pet:", err);
      toast.error(toErrMsg(err, "Failed to update pet status"));
    }
  }

  return (
    <>
      <Head>
        <title>Admin • Owner Detail</title>
      </Head>
      
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden md:block md:w-[240px] shrink-0">
            <AdminSidebar sticky />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 px-4 py-6 lg:px-6">
            {/* Back Button */}
            <button 
              onClick={() => router.back()} 
              className="mb-4 text-gray-600 hover:underline"
            >
              ← Back
            </button>

            {/* Loading State */}
            {loading && (
              <div className="py-16 text-center text-gray-500">Loading…</div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="py-16 text-center text-red-600">{error}</div>
            )}

            {/* Not Found State */}
            {!loading && !error && !owner && (
              <div className="py-16 text-center text-gray-500">Not found</div>
            )}

            {/* Owner Data */}
            {!loading && owner && (
              <section>
                {/* Header with Tabs */}
                <OwnerHeader
                  title={owner.name || owner.email}
                  tab={tab}
                  onTabChange={setTab}
                  owner={owner}
                />

                {/* Profile Tab */}
                {tab === "profile" && (
                  <OwnerProfileCard
                    owner={owner}
                    isSuspended={isSuspended}
                    onClickBan={() => {
                      setMode(isSuspended ? "unban" : "ban");
                      setDialogOpen(true);
                    }}
                  />
                )}

                {/* Pets Tab */}
                {tab === "pets" && (
                  <OwnerPetsList
                    pets={owner.pets}
                    onPetClick={(pet: PetItem) => {
                      setSelectedPet(pet);
                      setPetModalOpen(true);
                    }}
                  />
                )}

                {/* Reviews Tab */}
                {tab === "reviews" && (
                  <div className="px-10 pb-10 pt-6 text-gray-500">
                    No reviews.
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Ban/Unban Owner Dialog */}
      <BanConfirm
        open={dialogOpen}
        loading={dialogLoading}
        mode={mode}
        onOpenChange={setDialogOpen}
        onConfirm={handleBanUnban}
      />

      {/* Pet Detail Modal */}
      <PetDetailModal
        open={petModalOpen}
        onOpenChange={setPetModalOpen}
        pet={selectedPet}
        onToggleSuspend={handlePetToggleSuspend}
        loading={loading}
      />
    </>
  );
}