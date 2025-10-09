import PetForm from "@/components/features/pet/PetForm";
import { usePetsApi } from "@/hooks/usePets";
import {
  PetFormValues,
  formValuesToPayload,
  petService,
} from "@/lib/pet/pet-utils";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface BookingCreatePetProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>
  onSuccess?: () => void;
}
export default function BookingCreatePet(
  {
    open,
    onOpenChange,
    onSuccess
  }: BookingCreatePetProps) {
  const { getPetTypes } = usePetsApi();
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0); // สำหรับ reset form

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;

    // ✅ แก้ no-unused-expressions + กัน showModal ซ้ำ
    if (open && !d.open) {
      d.showModal();
      setFormKey(prev => prev + 1);
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  const handleSubmit = async (values: PetFormValues) => {
    try {
      setLoading(true);
      const payload = await formValuesToPayload(values, getPetTypes);
      await petService.createPet(payload);

      console.log("✅ Pet created successfully!"); // debug

      // toast.success(SUCCESS_MESSAGES.petCreated);
      onOpenChange(false)

      setTimeout(() => {
        if (onSuccess) {
          console.log("🔄 Calling onSuccess callback"); // debug
          onSuccess();
        }
      }, 100); // รอให้ dialog ปิดก่อน

    } catch (error) {
      // toast.error(getErrorMessage(error));
      console.error("Create pet failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <div>
      <dialog
        ref={dialogRef}
        onClose={() => onOpenChange(false)}
        className="fixed w-[800px] p-0 rounded-2xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="h-[80px] px-10 py-6 border-b border-gray-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold leading-8">Create Pet</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-4 hover:text-gray-6"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        <div className="w-[800px] h-[850px] p-10">
          <PetForm
            key={formKey}
            mode="create"
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </dialog>
    </div>
  );
}