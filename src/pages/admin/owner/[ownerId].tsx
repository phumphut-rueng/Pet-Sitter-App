import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminSidebar from "@/components/layout/AdminSidebar";
import OwnerHeader from "@/components/admin/owners/OwnerHeader";
import OwnerProfileCard from "@/components/admin/owners/OwnerProfileCard";
import OwnerPetsList from "@/components/admin/owners/OwnerPetsList";
import OwnerReviewsList from "@/components/admin/owners/OwnerReviewsList";
import PetDetailModal from "@/components/admin/owners/PetDetailModal";
import BanConfirm from "@/components/admin/owners/BanConfirm";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { useOwnerDetail } from "@/hooks/admin/useOwnerDetail";
import { useOwnerReviews } from "@/hooks/admin/useOwnerReviews";
import { getErrorMessage } from "@/lib/api/api-utils";
import toast from "react-hot-toast";
import { api } from "@/lib/api/axios";
import type { PetItem } from "@/types/admin/owners";

export default function OwnerDetailPage() {
  const router = useRouter();
  const ownerIdParam = router.query.ownerId as string | undefined;

  // รอให้ router พร้อมก่อนส่ง id ไปยัง hooks
  const effectiveOwnerId = router.isReady ? ownerIdParam : undefined;

  // Owner data - ใช้ effectiveOwnerId
  const { loading, error, owner, tab, setTab, refetch } = useOwnerDetail(effectiveOwnerId);
  const isSuspended = owner?.status === "ban";

  // Reviews - ใช้ effectiveOwnerId
  const {
    loading: reviewsLoading,
    error: reviewsError,
    reviews,
    meta: reviewsMeta,
  } = useOwnerReviews(effectiveOwnerId);

  // Dialog states
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [mode, setMode] = React.useState<"ban" | "unban">("ban");

  // Pet modal states
  const [selectedPet, setSelectedPet] = React.useState<PetItem | null>(null);
  const [petModalOpen, setPetModalOpen] = React.useState(false);

  // Optimistic hide: เก็บ id ของ pet ที่กด Suspend เพื่อให้การ์ดหายทันที
  const [hiddenPetIds, setHiddenPetIds] = React.useState<number[]>([]);

  /** Ban / Unban owner (cascade pets ทั้งคู่) */
  async function handleBanUnban() {
    if (!ownerIdParam) return;
    setDialogLoading(true);
    try {
      await api.post(`admin/owners/${ownerIdParam}/ban`, {
        action: mode,
        reason: mode === "ban" ? "Violated policy" : undefined,
        cascadePets: false,
      });
      setDialogOpen(false);
      toast.success(mode === "ban" ? "User banned" : "User unbanned");
      await refetch();

      if (mode === "unban") setHiddenPetIds([]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDialogLoading(false);
    }
  }

  /** Toggle Pet Ban (optimistic hide เมื่อ suspend) */
  async function handlePetToggleSuspend(petId: number, shouldBan: boolean) {
    // optimistic: ถ้าจะ ban ให้ซ่อนการ์ดก่อน
    if (shouldBan) setHiddenPetIds((prev) => (prev.includes(petId) ? prev : [...prev, petId]));

    try {
      await api.post(`admin/pets/${petId}/ban`, {
        action: shouldBan ? "ban" : "unban",
      });

      // ถ้า unban สำเร็จและตัวนี้เคยถูกซ่อนด้วย optimistic จากก่อนหน้า ให้ปลดซ่อน
      if (!shouldBan) {
        setHiddenPetIds((prev) => prev.filter((id) => id !== petId));
      }

      // อัปเดตข้อมูลจริง
      await refetch();
      toast.success(shouldBan ? "Pet banned" : "Pet unbanned");
      setPetModalOpen(false);
    } catch (err) {
      // ย้อนกลับ optimistic เมื่อ error
      if (shouldBan) {
        setHiddenPetIds((prev) => prev.filter((id) => id !== petId));
      }
      console.error("Failed to update pet:", err);
      toast.error(getErrorMessage(err, "Failed to update pet status"));
    }
  }

  // กรองรายการที่จะโชว์: ไม่แสดงตัวที่ถูกแบน + ไม่แสดงตัวที่ถูกซ่อนแบบ optimistic
  const visiblePets: PetItem[] =
    owner?.pets
      ?.filter((p) => !p.is_banned) // ไม่โชว์ตัวที่ถูกแบน
      .filter((p) => !hiddenPetIds.includes(p.id)) ?? []; // ไม่โชว์ตัวที่เพิ่งซ่อน

  return (
    <>
      <Head>
        <title>Admin • Owner Detail</title>
      </Head>

      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden shrink-0 md:block md:w-[240px]">
            <AdminSidebar sticky />
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1 px-4 py-6 lg:px-6">
            {/* Loading */}
            {loading && (
              <PetPawLoading message="Loading Owner Details" size="md" />
            )}

            {/* Error */}
            {!loading && error && <div className="py-16 text-center text-danger">{error}</div>}

            {/* Not Found */}
            {!loading && !error && !owner && router.isReady && ownerIdParam && (
              <div className="py-16 text-center text-ink">Not found</div>
            )}

            {/* Data */}
            {!loading && owner && (
              <section>
                <OwnerHeader title={owner?.name ?? "-"} tab={tab} onTabChange={setTab} showBack />

                {/* Profile */}
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

                {/* Pets */}
                {tab === "pets" && (
                  <OwnerPetsList
                    pets={visiblePets}
                    onPetClick={(pet: PetItem) => {
                      setSelectedPet(pet);
                      setPetModalOpen(true);
                    }}
                  />
                )}

                {/* Reviews */}
                {tab === "reviews" && (
                  <OwnerReviewsList
                    reviews={reviews}
                    meta={reviewsMeta}
                    loading={reviewsLoading}
                    error={reviewsError}
                  />
                )}
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Ban Confirmation Dialog */}
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