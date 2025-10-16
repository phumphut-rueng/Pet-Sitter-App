import * as React from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import AccountPageShell from "@/components/layout/AccountPageShell";
import PetForm from "@/components/features/pet/PetForm";
import { PetPawLoading } from "@/components/loading/PetPawLoading"; 
import { usePetsApi } from "@/hooks/usePets";
import {
  PetFormValues,
  ROUTES,
  SUCCESS_MESSAGES,
  getErrorMessage,
  formValuesToPayload,
  petService,
} from "@/lib/pet/pet-utils";

/** แปลงค่า query.refresh เป็น key สำหรับ remount ฟอร์ม */
function getRefreshKey(refresh: string | string[] | undefined): string {
  if (Array.isArray(refresh)) return refresh[0] ?? "create-form";
  return typeof refresh === "string" ? refresh : "create-form";
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

export default function CreatePetPage() {
  const router = useRouter();
  const { getPetTypes } = usePetsApi();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [overlayMessage, setOverlayMessage] = React.useState<string | null>(null);

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
      if (isSubmitting) return;              // กันดับเบิลคลิก
      try {
        setIsSubmitting(true);
        setOverlayMessage("Creating pet..."); //  ข้อความ overlay

        // อาจมีอัปโหลดรูป → ใช้ overlay คลุมช่วงนี้ไว้
        const payload = await formValuesToPayload(values, getPetTypes);

        await petService.createPet(payload);

        toast.success(SUCCESS_MESSAGES.petCreated);
        goList();
      } catch (err) {
        toast.error(getErrorMessage(err));
        console.error("Create pet failed:", err);
      } finally {
        setOverlayMessage(null);
        setIsSubmitting(false);
      }
    },
    [getPetTypes, goList, isSubmitting]
  );

  return (
    <AccountPageShell title="Your Pet">
      <div className="relative min-h-[400px]">
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
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
          <h1 className="text-2xl text-h3-bold text-black">Create Pet</h1>
        </div>

        <PetForm
          key={formKey}
          mode="create"
          loading={isSubmitting}   // disable ปุ่มระหว่าง submit
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        {/*  Overlay ตอนกำลังส่ง/อัปโหลด */}
        {overlayMessage && <LoadingOverlay message={overlayMessage} />}
      </div>
    </AccountPageShell>
  );
}