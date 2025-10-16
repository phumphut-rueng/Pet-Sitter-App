import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import AdminSidebar from "@/components/layout/AdminSidebar";
import OwnerHeader from "@/components/admin/owners/OwnerHeader";
import OwnerProfileCard from "@/components/admin/owners/OwnerProfileCard";
import OwnerPetsList from "@/components/admin/owners/OwnerPetsList";
import OwnerReviewsList from "@/components/admin/owners/OwnerReviewsList";
import PetDetailModal from "@/components/admin/owners/PetDetailModal";
import BanConfirm from "@/components/admin/owners/BanConfirm";
import { PetPawLoading } from "@/components/loading/PetPawLoading";

import { useOwnerDetail } from "@/hooks/admin/useOwnerDetail";
import { useOwnerActions } from "@/hooks/admin/useOwnerActions";
import { useOwnerReviews } from "@/hooks/admin/useOwnerReviews";
import { usePetActions } from "@/hooks/admin/usePetActions";

import type { PetItem } from "@/types/admin/owners";

export default function OwnerDetailPage() {
  const router = useRouter();
  const ownerId = router.query.ownerId as string | undefined;

  // Fetch data
  const { loading, error, owner, tab, setTab, refetch } = useOwnerDetail(ownerId);
  const { banOwner, unbanOwner, loading: banLoading } = useOwnerActions(ownerId, refetch);
  const { loading: reviewsLoading, error: reviewsError, reviews, meta: reviewsMeta } = useOwnerReviews(ownerId);
  const { togglePetBan, loading: petLoading } = usePetActions(refetch);

  // Local state
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetItem | null>(null);
  const [hiddenPets, setHiddenPets] = useState<number[]>([]);

  const isBanned = owner?.status === "ban";

  // แบน/ปลดแบน owner
  async function handleBanUnban() {
    const action = isBanned ? "unban" : "ban";
    const loadingToast = toast.loading(`${action === "ban" ? "Banning" : "Unbanning"} user...`);

    try {
      if (action === "ban") {
        await banOwner("Violated policy", false);
      } else {
        await unbanOwner();
        setHiddenPets([]);
      }

      toast.success(`User ${action === "ban" ? "banned" : "unbanned"} successfully`, { id: loadingToast });
      setBanDialogOpen(false);
    } catch {
      toast.error("Failed to update user status", { id: loadingToast });
    }
  }

  // แบน/ปลดแบน pet
  async function handlePetBan(petId: number, shouldBan: boolean) {
    if (shouldBan) {
      setHiddenPets((prev) => [...prev, petId]);
    }

    const loadingToast = toast.loading(`${shouldBan ? "Suspending" : "Unsuspending"} pet...`);

    try {
      await togglePetBan(petId, shouldBan);
      toast.success(`Pet ${shouldBan ? "suspended" : "unsuspended"} successfully`, { id: loadingToast });

      setPetModalOpen(false);
      setSelectedPet(null);

      if (!shouldBan) {
        setHiddenPets((prev) => prev.filter((id) => id !== petId));
      }
    } catch {
      if (shouldBan) {
        setHiddenPets((prev) => prev.filter((id) => id !== petId));
      }
      toast.error("Failed to update pet status", { id: loadingToast });
    }
  }

  const visiblePets = owner?.pets?.filter((p) => !p.is_banned && !hiddenPets.includes(p.id)) ?? [];

  // กำลังโหลด
  if (loading) {
    return (
      <>
        <Head><title>Admin • Owner Detail</title></Head>
        <div className="flex min-h-screen w-full">
          <aside className="hidden shrink-0 md:block md:w-[240px]">
            <AdminSidebar sticky />
          </aside>
          <main className="flex flex-1 items-center justify-center">
            <PetPawLoading message="Loading Owner Details" size="md" />
          </main>
        </div>
      </>
    );
  }

  // มี error
  if (error) {
    return (
      <>
        <Head><title>Admin • Owner Detail</title></Head>
        <div className="flex min-h-screen w-full">
          <aside className="hidden shrink-0 md:block md:w-[240px]">
            <AdminSidebar sticky />
          </aside>
          <main className="flex flex-1 items-center justify-center">
            <div className="text-danger">{error}</div>
          </main>
        </div>
      </>
    );
  }

  // ไม่เจอ owner
  if (!owner) {
    return (
      <>
        <Head><title>Admin • Owner Detail</title></Head>
        <div className="flex min-h-screen w-full">
          <aside className="hidden shrink-0 md:block md:w-[240px]">
            <AdminSidebar sticky />
          </aside>
          <main className="flex flex-1 items-center justify-center">
            <div className="text-ink">Owner not found</div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin • Owner Detail</title>
      </Head>

      <div className="flex min-h-screen w-full">
        <aside className="hidden shrink-0 md:block md:w-[240px]">
          <AdminSidebar sticky />
        </aside>

        <main className="relative flex-1 px-4 py-6 lg:px-6">
          <div className="mx-auto max-w-[1200px]">
            <OwnerHeader 
              title={owner.name || "Unknown"} 
              tab={tab} 
              onTabChange={setTab} 
              showBack 
            />

            {tab === "profile" && (
              <OwnerProfileCard
                owner={owner}
                isSuspended={isBanned}
                onClickBan={() => setBanDialogOpen(true)}
              />
            )}

            {tab === "pets" && (
              <OwnerPetsList
                pets={visiblePets}
                onPetClick={(pet) => {
                  setSelectedPet(pet);
                  setPetModalOpen(true);
                }}
              />
            )}

            {tab === "reviews" && (
              <OwnerReviewsList
                reviews={reviews}
                meta={reviewsMeta}
                loading={reviewsLoading}
                error={reviewsError}
              />
            )}
          </div>

          {/* Loading overlay เวลาแบน/ปลดแบน */}
          {banLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
              <PetPawLoading
                message={isBanned ? "Unbanning User..." : "Banning User..."}
                size="md"
              />
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <BanConfirm
        open={banDialogOpen}
        loading={banLoading}
        mode={isBanned ? "unban" : "ban"}
        onOpenChange={setBanDialogOpen}
        onConfirm={handleBanUnban}
      />

      <PetDetailModal
        open={petModalOpen}
        onOpenChange={setPetModalOpen}
        pet={selectedPet}
        onToggleSuspend={handlePetBan}
        loading={petLoading}
      />
    </>
  );
}