import * as React from "react";
import { useRouter } from "next/router";
import AccountPageShell from "@/components/layout/AccountPageShell";
import PetForm from "@/components/features/pet/PetForm";
import type { PetFormValues } from "@/types/pet.types";
import AlertConfirm from "@/components/modal/AlertConfirm";

const MOCK: Record<string, PetFormValues> = {
  "1": { name: "Bubba", type: "Dog", breed: "Pit Bull", sex: "Male", ageMonth: "12", color: "Gray", weightKg: "25", about: "", image: "/images/demo/bubba.svg" },
  "2": { name: "Daisy", type: "Dog", breed: "Beagle", sex: "Female", ageMonth: "0.6", color: "White, black and brown", weightKg: "2", about: "", image: "/images/demo/daisy.svg" },
  "3": { name: "I Som", type: "Cat", breed: "Ginger", sex: "Male", ageMonth: "18", color: "Orange", weightKg: "4.5", about: "", image: "/images/demo/isom.svg" },
  "4": { name: "Noodle Birb", type: "Bird", breed: "Parakeet", sex: "Female", ageMonth: "10", color: "Green", weightKg: "0.2", about: "", image: "/images/demo/bird.svg" },
};

export default function PetDetailPage() {
  const router = useRouter();
  const ready = router.isReady;
  const id = ready ? (router.query.id as string) : undefined;

  const initial = React.useMemo(
    () => (id ? MOCK[id] : undefined),
    [id]
  );

  const [confirmOpen, setConfirmOpen] = React.useState(false);

  if (!ready) return null;


  const description = (
    <div className="space-y-4">
      <p className="text-slate-600">Are you sure to delete this pet?</p>
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          onClick={() => setConfirmOpen(false)}
          className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            console.log("delete", id);
            setConfirmOpen(false);
            router.push("/account/pet");
          }}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <AccountPageShell title="Your Pet">
      <PetForm
        mode="edit"
        initialValues={initial}    
        onSubmit={async (values) => {
            console.log("update", id, values);
            router.push("/account/pet");
        }}
        onCancel={() => router.push("/account/pet")}
        onDelete={() => setConfirmOpen(true)}
      />

      <AlertConfirm
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Confirmation"
        width={400}
        description={description}
      />
    </AccountPageShell>
  );
}