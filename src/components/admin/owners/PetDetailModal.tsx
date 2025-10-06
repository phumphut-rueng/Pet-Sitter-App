import * as React from "react";
import Image from "next/image";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";

type Pet = {
  id: number;
  name: string | null;
  image_url: string | null;
  pet_type_name?: string;
  breed: string | null;
  sex: string | null;
  age_month: number | null;
  color: string | null;
  // optional
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

export default function PetDetailModal({ open, onOpenChange, pet, onToggleSuspend, loading }: Props) {
  if (!pet) return null;

  const isSuspended = Boolean(pet.is_banned);
  const actionLabel = isSuspended ? "Unsuspend This Pet" : "Suspend This Pet";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[720px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{pet.name || "Pet"}</AlertDialogTitle>
          <AlertDialogDescription>
            Pet detail information
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-[220px,1fr] gap-8 py-4">
          <div className="justify-self-center">
            <div className="h-[160px] w-[160px] rounded-full overflow-hidden">
              {pet.image_url ? (
                <Image src={pet.image_url} alt={pet.name ?? ""} width={160} height={160} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gray-200 grid place-items-center text-gray-600">
                  {(pet.name || "?")[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="mt-3 text-center font-medium">{pet.name || "-"}</div>
          </div>

          <div className="bg-[#FAFAFB] rounded-lg p-6 grid grid-cols-2 gap-y-5">
            <Field label="Pet Type" value={pet.pet_type_name || "-"} />
            <Field label="Breed" value={pet.breed || "-"} />
            <Field label="Sex" value={pet.sex || "-"} />
            <Field label="Age" value={pet.age_month != null ? `${pet.age_month} Month` : "-"} />
            <Field label="Color" value={pet.color || "-"} />
            <Field label="Weight" value={pet.weight_kg != null ? `${pet.weight_kg} Kg` : "-"} />
            <div className="col-span-2">
              <Field label="About" value={(pet as any).about || "-"} />
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full px-6 py-3 bg-orange-50 text-orange-500 hover:bg-orange-100">
            Close
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={() => onToggleSuspend(pet.id, !isSuspended)}
            className="rounded-full px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Processing..." : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}