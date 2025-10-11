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

type AxiosLikeError = {
  message?: string;
  response?: { data?: unknown; status?: number };
};

export default function OwnerDetailPage() {
  const router = useRouter();
  const ownerIdParam = router.query.ownerId as string | undefined;

  const effectiveOwnerId = router.isReady ? ownerIdParam : undefined;

  const { loading, error, owner, tab, setTab, refetch } = useOwnerDetail(effectiveOwnerId);
  const isSuspended = owner?.status === "ban";

  const {
    loading: reviewsLoading,
    error: reviewsError,
    reviews,
    meta: reviewsMeta,
  } = useOwnerReviews(effectiveOwnerId);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [mode, setMode] = React.useState<"ban" | "unban">("ban");

  const [selectedPet, setSelectedPet] = React.useState<PetItem | null>(null);
  const [petModalOpen, setPetModalOpen] = React.useState(false);
  const [petActionLoading, setPetActionLoading] = React.useState(false);

  const [hiddenPetIds, setHiddenPetIds] = React.useState<number[]>([]);

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
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setDialogLoading(false);
    }
  }

  /** Toggle Pet Ban (optimistic hide เมื่อ suspend) */
  async function handlePetToggleSuspend(petId: number, shouldBan: boolean) {
    console.log(" Frontend: handlePetToggleSuspend called!", { petId, shouldBan });

    if (shouldBan) {
      setHiddenPetIds((prev) => (prev.includes(petId) ? prev : [...prev, petId]));
      console.log(" Frontend: Hidden pet:", petId);
    }

    setPetActionLoading(true);

    try {
      console.log(" Frontend: Calling API...");
      console.log(" Frontend: URL:", `admin/pets/${petId}/ban`);
      console.log(" Frontend: Body:", { action: shouldBan ? "ban" : "unban" });

      const response = await api.post(`admin/pets/${petId}/ban`, {
        action: shouldBan ? "ban" : "unban",
        reason: shouldBan ? "Violated policy" : undefined,
      });

      console.log(" Frontend: API Response:", response.data);

      console.log(" Frontend: Starting refetch...");
      await refetch();
      console.log(" Frontend: Refetch done");

      toast.success(shouldBan ? "Pet suspended" : "Pet unsuspended");

      setPetModalOpen(false);
      setSelectedPet(null);

      if (!shouldBan) {
        setHiddenPetIds((prev) => prev.filter((id) => id !== petId));
      }
    } catch (err: unknown) {
      // ปลอด any: แปลงเป็นชนิดที่เราตรวจสอบได้
      const ax = err as AxiosLikeError;
      console.error(" Frontend: ERROR:", err);
      if (ax.message) console.error(" Frontend: ERROR Message:", ax.message);
      if (ax.response) {
        console.error(" Frontend: ERROR Response:", ax.response.data);
        console.error(" Frontend: ERROR Status:", ax.response.status);
      }

      if (shouldBan) {
        setHiddenPetIds((prev) => prev.filter((id) => id !== petId));
      }
      toast.error(getErrorMessage(err, "Failed to update pet status"));
      throw err;
    } finally {
      setPetActionLoading(false);
      console.log(" Frontend: Loading done");
    }
  }

  const visiblePets: PetItem[] =
    owner?.pets?.filter((p) => !p.is_banned).filter((p) => !hiddenPetIds.includes(p.id)) ?? [];

  return (
    <>
      <Head>
        <title>Admin • Owner Detail</title>
      </Head>

      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex gap-6">
          <aside className="hidden shrink-0 md:block md:w-[240px]">
            <AdminSidebar sticky />
          </aside>

          <main className="min-w-0 flex-1 px-4 py-6 lg:px-6">
            {loading && <PetPawLoading message="Loading Owner Details" size="md" />}

            {!loading && error && <div className="py-16 text-center text-danger">{error}</div>}

            {!loading && !error && !owner && router.isReady && ownerIdParam && (
              <div className="py-16 text-center text-ink">Not found</div>
            )}

            {!loading && owner && (
              <section>
                <OwnerHeader title={owner?.name ?? "-"} tab={tab} onTabChange={setTab} showBack />

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

                {tab === "pets" && (
                  <OwnerPetsList
                    pets={visiblePets}
                    onPetClick={(pet: PetItem) => {
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

      <PetDetailModal
        open={petModalOpen}
        onOpenChange={setPetModalOpen}
        pet={selectedPet}
        onToggleSuspend={handlePetToggleSuspend}
        loading={petActionLoading}
      />
    </>
  );
}