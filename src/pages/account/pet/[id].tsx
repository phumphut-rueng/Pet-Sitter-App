import * as React from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AccountPageShell from "@/components/layout/AccountPageShell";
import PetForm from "@/components/features/pet/PetForm";
import PageToaster from "@/components/ui/PageToaster";
import { usePetsApi } from "@/hooks/usePets";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PetFormValues,
  ROUTES,
  SUCCESS_MESSAGES,
  getErrorMessage,
  parsePetId,
  petResponseToFormValues,
  formValuesToPayload,
  petService, // 🔹 petService ใช้ axios ทั้งหมด (ไม่มี fetch API)
} from "@/lib/pet/pet-utils";

/**
 * 📄 หน้าแก้ไขข้อมูล Pet
 * ใช้ axios ผ่าน petService ในการเรียก API ทั้งหมด
 */
export default function EditPetPage() {
  const router = useRouter();
  const { getPetTypes } = usePetsApi();

  // แปลง query parameter เป็น pet ID
  const petId = React.useMemo(() => parsePetId(router.query.id), [router.query.id]);

  const [loading, setLoading] = React.useState(true);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [initialValues, setInitialValues] = React.useState<PetFormValues | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  /**
   * โหลดข้อมูล pet เมื่อ component mount หรือ petId เปลี่ยน
   * ใช้ petService.fetchPet() ซึ่งภายในใช้ axios.get()
   */
  React.useEffect(() => {
    if (!petId) return;
    let active = true; // ป้องกัน memory leak

    (async () => {
      try {
        setLoading(true);
        setServerError(null);
        
        // เรียก axios.get() ผ่าน petService.fetchPet()
        // หมายเหตุ: ชื่อ "fetchPet" เป็นแค่ชื่อฟังก์ชัน ไม่ได้ใช้ fetch API
        const pet = await petService.fetchPet(petId);
        
        if (!active) return;
        setInitialValues(petResponseToFormValues(pet));
      } catch (error) {
        if (!active) return;
        const msg = getErrorMessage(error);
        setServerError(msg);
        toast.error(msg);
      } finally {
        if (active) setLoading(false);
      }
    })();

    // cleanup: ป้องกัน set state หลัง unmount
    return () => { active = false; };
  }, [petId]);

  /**
   * อัพเดทข้อมูล pet
   * ใช้ petService.updatePet() ซึ่งภายในใช้ axios.put()
   */
  const handleSubmit = async (values: PetFormValues) => {
    if (!petId) return;
    try {
      const payload = await formValuesToPayload(values, getPetTypes);
      
      // เรียก axios.put() ผ่าน petService.updatePet()
      await petService.updatePet(petId, payload);
      
      toast.success(SUCCESS_MESSAGES.petUpdated);
      router.push(ROUTES.petList);
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      console.error("Update pet failed:", error);
    }
  };

  /**
   * ลบ pet
   * ใช้ petService.deletePet() ซึ่งภายในใช้ axios.delete()
   */
  const handleDelete = async () => {
    if (!petId) return;
    try {
      // เรียก axios.delete() ผ่าน petService.deletePet()
      await petService.deletePet(petId);
      
      toast.success(SUCCESS_MESSAGES.petDeleted);
      router.push(ROUTES.petList);
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      console.error("Delete pet failed:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  /** ยกเลิกการแก้ไข กลับไปหน้ารายการ pet */
  const handleCancel = () => router.push(ROUTES.petList);

  return (
    <AccountPageShell title="Your Pet">
      <PageToaster />

      {/* Header พร้อมปุ่ม Back */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted/60"
          aria-label="Go back"
          title="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-ink">Your Pet</h1>
      </div>

      {/* แสดง Loading หรือ Form */}
      {loading ? (
        <div className="text-slate-600">Loading...</div>
      ) : (
        <>
          {/* ฟอร์มแก้ไข Pet */}
          <PetForm
            mode="edit"
            initialValues={initialValues ?? undefined}
            serverError={serverError}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={() => setShowDeleteDialog(true)}
          />

          {/* Dialog ยืนยันการลบ */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent className="p-0 rounded-2xl font-[700] border-transparent w-[90vw] max-w-[400px]">
              <div className="p-3 pl-5 flex justify-between items-center border-b border-gray-2">
                <AlertDialogTitle className="text-black text-[20px]">
                  Delete Confirmation
                </AlertDialogTitle>
                <AlertDialogCancel className="text-gray-4 border-transparent shadow-transparent hover:text-gray-9 text-[17px]">
                  ✕
                </AlertDialogCancel>
              </div>
              <div className="pl-5 pr-4 pt-4 pb-2 text-[16px] font-normal text-ink/80">
                Are you sure to delete this pet?
              </div>
              <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-3">
                <AlertDialogCancel className="h-11 rounded-full bg-orange-1/40 text-orange-6 font-semibold hover:bg-orange-1/60 transition">
                  Cancel
                </AlertDialogCancel>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="h-11 rounded-full bg-brand text-white font-bold hover:brightness-95 transition"
                >
                  Delete
                </button>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </AccountPageShell>
  );
}