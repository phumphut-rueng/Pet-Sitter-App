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
  weight_kg?: number | null;
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
      <div className="text-gray-6 text-sm2-regular mb-1">{label}</div>
      <div className="text-ink text-sm2-medium">{value}</div>
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
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] rounded-2xl bg-white shadow-xl z-50 focus:outline-none">
            {/*  เพิ่ม Description (ซ่อนไว้) */}
            <Dialog.Description className="sr-only">
              Pet details for {pet.name}
            </Dialog.Description>

            {/* Header */}
            <div className="h-[80px] px-10 py-6 border-b border-gray-2 flex items-center justify-between">
              <Dialog.Title className="h3-bold text-ink">{pet.name || "Pet"}</Dialog.Title>
              <Dialog.Close className="text-gray-4 hover:text-gray-6 focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg rounded">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="w-[800px] h-[528px] p-10 flex gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 w-[240px] shrink-0">
                <div className="relative w-[240px] h-[240px] rounded-full overflow-hidden bg-gray-1">
                  {pet.image_url ? (
                    <Image
                      src={pet.image_url}
                      alt={pet.name ?? "Pet"}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-6 text-4xl font-semibold">
                      {(pet.name || "?")[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div className="text-center h4-bold text-ink">{pet.name || "-"}</div>
              </div>

              {/* Info */}
              <div className="w-[440px] h-[392px] bg-white-1 rounded-lg p-6 flex flex-col shrink-0">
                <div className="grid grid-cols-2 gap-x-10 gap-y-10">
                  <Field label="Pet Type" value={pet.pet_type_name || "-"} />
                  <Field label="Breed" value={pet.breed || "-"} />
                  <Field label="Sex" value={pet.sex || "-"} />
                  <Field label="Age" value={pet.age_month != null ? `${pet.age_month} Month` : "-"} />
                  <Field label="Color" value={pet.color || "-"} />
                  <Field label="Weight" value={pet.weight_kg != null ? `${pet.weight_kg} Kilogram` : "-"} />
                </div>

                <div className="mt-10 pt-10 border-t border-gray-2">
                  <Field label="About" value={pet.about || "-"} />
                </div>

                <div className="flex justify-end mt-auto">
                  <button
                    disabled={loading}
                    onClick={() => setConfirmOpen(true)}
                    className="px-6 py-3 rounded-xl text-sm2-medium text-orange-5 hover:bg-orange-1 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg"
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