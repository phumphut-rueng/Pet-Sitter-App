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
} from "@/lib/pet/pet-utils";

export default function CreatePetPage() {
  const router = useRouter();
  const { getPetTypes } = usePetsApi();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: PetFormValues) => {
    try {
      setLoading(true);
      const payload = await formValuesToPayload(values, getPetTypes);
      await petService.createPet(payload);
      toast.success(SUCCESS_MESSAGES.petCreated);
      router.push(ROUTES.petList);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Create pet failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push(ROUTES.petList);

  return (
    <AccountPageShell title="Your Pet">
      <PageToaster />
      <PetForm mode="create" loading={loading} onSubmit={handleSubmit} onCancel={handleCancel} />
    </AccountPageShell>
  );
}