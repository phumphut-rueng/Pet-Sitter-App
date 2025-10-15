import * as React from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import PetSuspendConfirmDialog from "./PetSuspendConfirmDialog";

type Pet = {
  id: number;
  name: string | null;
  image_url: string | null;
  pet_type_name?: string | null;
  breed: string | null;
  sex: string | null;
  age_month: number | null;
  color: string | null;
  about?: string | null;
  weight_kg?: string | number | null;
  is_banned?: boolean | null;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pet: Pet | null;
  onToggleSuspend: (petId: number, nextSuspend: boolean) => Promise<void>;
  loading?: boolean;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-sm2-regular text-gray-6">{label}</div>
      <div className="text-sm2-medium text-ink">{value}</div>
    </div>
  );
}

export default function PetDetailModal({
  open,
  onOpenChange,
  pet,
  onToggleSuspend,
  loading,
}: Props) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  if (!pet) return null;

  const isSuspended = !!pet.is_banned;
  const actionLabel = isSuspended ? "Unsuspend This Pet" : "Suspend This Pet";

  const handleConfirm = async () => {
    await onToggleSuspend(pet.id, !isSuspended);
    setConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[800px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-xl focus:outline-none">
          <Dialog.Description className="sr-only">
            Pet details for {pet.name}
          </Dialog.Description>

          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 flex h-[80px] items-center justify-between border-b border-gray-2 bg-white px-10 py-6">
            <Dialog.Title className="h3-bold text-ink">{pet.name || "Pet"}</Dialog.Title>
            <Dialog.Close className="rounded text-gray-4 hover:text-gray-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex gap-6 p-10">
            {/* Avatar */}
            <div className="flex w-[240px] shrink-0 flex-col items-center gap-3">
              <div className="relative h-[240px] w-[240px] overflow-hidden rounded-full bg-gray-1">
                {pet.image_url ? (
                  <Image
                    src={pet.image_url}
                    alt={pet.name ?? "Pet"}
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-gray-6">
                    {(pet.name || "?")[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              <div className="h4-bold text-center text-ink">{pet.name || "-"}</div>
            </div>

            {/* Info + Button Container */}
            <div className="flex w-[440px] shrink-0 flex-col gap-4">
              {/* Info */}
              <div className="rounded-lg bg-white-1 p-6">
                <div className="grid grid-cols-2 gap-x-10 gap-y-10">
                  <Field label="Pet Type" value={pet.pet_type_name || "-"} />
                  <Field label="Breed" value={pet.breed || "-"} />
                  <Field label="Sex" value={pet.sex || "-"} />
                  <Field label="Age" value={pet.age_month != null ? `${pet.age_month} Month` : "-"} />
                  <Field label="Color" value={pet.color || "-"} />
                  <Field label="Weight" value={pet.weight_kg != null ? `${pet.weight_kg} Kilogram` : "-"} />
                </div>

                <div className="mt-10 border-t border-gray-2 pt-10">
                  <div className="mb-1 text-sm2-regular text-gray-6">About</div>
                  <div className="whitespace-pre-wrap break-words text-sm2-regular text-ink">
                    {pet.about || "-"}
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-end">
                <button
                  disabled={loading}
                  onClick={() => setConfirmOpen(true)}
                  className="rounded-xl px-6 py-3 text-sm2-medium text-orange-5 transition-colors hover:bg-orange-1 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  {actionLabel}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <PetSuspendConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        petName={pet.name || "this pet"}
        isSuspended={isSuspended}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
}