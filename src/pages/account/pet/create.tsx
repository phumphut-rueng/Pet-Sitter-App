import * as React from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import AccountPageShell from "@/components/layout/AccountPageShell";
import PetForm from "@/components/features/pet/PetForm";
import { usePetsApi } from "@/hooks/usePets";
import {
  PetFormValues,
  ROUTES,
  SUCCESS_MESSAGES,
  getErrorMessage,
  formValuesToPayload,
  petService,
} from "@/lib/pet/pet-utils";

/** แปลงค่า query.refresh  string ที่ใช้เป็น key ได้เสมอ */
function getRefreshKey(refresh: string | string[] | undefined): string {
  if (Array.isArray(refresh)) return refresh[0] ?? "create-form";
  return typeof refresh === "string" ? refresh : "create-form";
}

export default function CreatePetPage() {
  const router = useRouter();
  const { getPetTypes } = usePetsApi();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // เปลี่ยน key เพื่อ remount ฟอร์มถ้า refresh=... เปลี่ยน
  const formKey = React.useMemo(
    () => getRefreshKey(router.query.refresh),
    [router.query.refresh]
  );

  const goList = React.useCallback(() => {
    router.push(ROUTES.petList);
  }, [router]);

  const handleCancel = React.useCallback(() => {
    goList();
  }, [goList]);

  const handleSubmit = React.useCallback(
    async (values: PetFormValues) => {
      try {
        setIsSubmitting(true);
        const payload = await formValuesToPayload(values, getPetTypes);
        await petService.createPet(payload);
        toast.success(SUCCESS_MESSAGES.petCreated);
        goList();
      } catch (err) {
        toast.error(getErrorMessage(err));
        console.error("Create pet failed:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [getPetTypes, goList]
  );

  return (
    <AccountPageShell title="Your Pet">
      <PetForm
        key={formKey}
        mode="create"
        loading={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </AccountPageShell>
  );
}