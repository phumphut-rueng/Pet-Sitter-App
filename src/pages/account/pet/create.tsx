import * as React from "react";
import { useRouter } from "next/router";
import AccountPageShell from "@/components/layout/AccountPageShell";
import PetForm from "@/components/features/pet/PetForm";
import type { PetFormValues } from "@/types/pet.types";

export default function CreatePetPage() {
  const router = useRouter();

  const handleSubmit = async (values: PetFormValues) => {
    // รอ POST /api/pet
    console.log("Create Pet:", values);
    router.push("/account/pet");
  };

  return (
    <AccountPageShell title="Your Pet">
      <PetForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/account/pet")}
      />
    </AccountPageShell>
  );
}