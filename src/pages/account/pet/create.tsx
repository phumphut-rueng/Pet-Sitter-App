import * as React from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AccountPageShell from "@/components/layout/AccountPageShell";
import PetForm from "@/components/features/pet/PetForm";
import PageToaster from "@/components/ui/PageToaster";
import { usePetsApi } from "@/hooks/usePets";
import {
  PetFormValues,
  ROUTES,
  SUCCESS_MESSAGES,
  getErrorMessage,
  formValuesToPayload,
  petService,
  delayedNavigation
} from "@/lib/pet-utils";


export default function CreatePetPage() {
  const router = useRouter();
  const { getPetTypes } = usePetsApi();

  const handleSubmit = async (values: PetFormValues) => {
    try {

      const payload = await formValuesToPayload(values, getPetTypes);
      
      // Create pet via API
      await petService.createPet(payload);
      
      // Show success message and navigate
      toast.success(SUCCESS_MESSAGES.petCreated);
      delayedNavigation(router, ROUTES.petList);
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Create pet failed:", error);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.petList);
  };

  return (
    <AccountPageShell title="Your Pet">
      <PageToaster />
      <PetForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </AccountPageShell>
  );
}