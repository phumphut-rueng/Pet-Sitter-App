import * as React from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import AccountPageShell from "@/components/layout/AccountPageShell";
import PetForm from "@/components/features/pet/PetForm";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import { usePetsApi } from "@/hooks/usePets";
import { usePetDetail } from "@/hooks/usePetDetail";

import {
  PetFormValues,
  ROUTES,
  SUCCESS_MESSAGES,
  getErrorMessage,
  parsePetId,
  formValuesToPayload,
  petService,
} from "@/lib/pet/pet-utils";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted/60"
      aria-label="Go back"
      title="Back"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 19L8 12L15 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-0 rounded-2xl font-[700] border-transparent w-[90vw] max-w-[400px]">
        <div className="p-3 pl-5 flex justify-between items-center border-b border-gray-2">
          <AlertDialogTitle className="text-black text-[20px]">
            Delete Confirmation
          </AlertDialogTitle>
          <AlertDialogCancel className="text-gray-4 border-transparent shadow-transparent hover:text-gray-9 text-[17px]">
            ✕
          </AlertDialogCancel>
        </div>

        <AlertDialogDescription className="pl-5 pr-4 pt-4 pb-2 text-[16px] font-normal text-ink/80">
          Are you sure to delete this pet?
        </AlertDialogDescription>

        <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-3">
          <AlertDialogCancel className="h-11 rounded-full bg-orange-1/40 text-orange-6 font-semibold hover:bg-orange-1/60 transition">
            Cancel
          </AlertDialogCancel>
          <button
            type="button"
            onClick={onConfirm}
            className="h-11 rounded-full bg-brand text-white font-bold hover:brightness-95 transition"
          >
            Delete
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/20 flex items-center justify-center">
      <PetPawLoading
        message={message}
        size="md"
        baseStyleCustum="flex items-center justify-center"
      />
    </div>
  );
}

export default function EditPetPage() {
  const router = useRouter();
  const { getPetTypes } = usePetsApi();

  const petId = React.useMemo<number | null>(
    () => (parsePetId(router.query.id) ?? null),
    [router.query.id]
  );

  const { isLoading, error, values } = usePetDetail(petId);

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [overlayMessage, setOverlayMessage] = React.useState<string | null>(null);

  const goBack = React.useCallback(() => router.back(), [router]);

  const goList = React.useCallback(() => {
    router.push(ROUTES.petList);
  }, [router]);

  const handleSubmit = React.useCallback(
    async (formValues: PetFormValues) => {
      if (!petId) return;
      try {
        setOverlayMessage("Updating pet...");
        const payload = await formValuesToPayload(formValues, getPetTypes);
        await petService.updatePet(petId, payload);
        toast.success(SUCCESS_MESSAGES.petUpdated);
        goList();
      } catch (err) {
        const msg = getErrorMessage(err);
        toast.error(msg);
        console.error("Update pet failed:", err);
      } finally {
        setOverlayMessage(null);
      }
    },
    [petId, getPetTypes, goList]
  );

  const handleDelete = React.useCallback(async () => {
    if (!petId) return;
    try {
      setOverlayMessage("Deleting pet...");
      await petService.deletePet(petId);
      toast.success(SUCCESS_MESSAGES.petDeleted);
      goList();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      console.error("Delete pet failed:", err);
    } finally {
      setOverlayMessage(null);
      setShowDeleteDialog(false);
    }
  }, [petId, goList]);

  return (
    <AccountPageShell title="Your Pet">
      <div className="relative min-h-[400px]">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <BackButton onClick={goBack} />
          <h1 className="text-2xl font-bold text-ink">Your Pet</h1>
        </div>

        {/* Content */}
        {!isLoading && (
          <>
            <PetForm
              mode="edit"
              initialValues={values ?? undefined}
              serverError={error}
              onSubmit={handleSubmit}
              onCancel={goList}
              onDelete={() => setShowDeleteDialog(true)}
            />

            <DeleteConfirmDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              onConfirm={handleDelete}
            />
          </>
        )}

        {/* Overlay: loading details */}
        {isLoading && <LoadingOverlay message="Loading Pet Details..." />}

        {/* Overlay: updating / deleting */}
        {overlayMessage && <LoadingOverlay message={overlayMessage} />}
      </div>
    </AccountPageShell>
  );
}