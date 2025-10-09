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

  //  รองรับรีเซ็ตฟอร์มเมื่อมี query เปลี่ยน (เช่น ?refresh=timestamp)
  const refreshQuery =
    Array.isArray(router.query.refresh) ? router.query.refresh[0] : router.query.refresh;
  const formKey = typeof refreshQuery === "string" ? refreshQuery : "create-form";

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
      <PetForm
        key={formKey} //  key เปลี่ยนเมื่อ refresh เปลี่ยน ฟอร์ม remount/ล้างค่า
        mode="create"
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </AccountPageShell>
  );
}