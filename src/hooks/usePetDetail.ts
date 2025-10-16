import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getErrorMessage,
  petResponseToFormValues,
  petService,
  type PetFormValues,
} from "@/lib/pet/pet-utils";

/**
 * โหลดรายละเอียดสัตว์เลี้ยง -> ค่าเริ่มต้นของฟอร์ม
 * - isLoading / error ครบ
 * - reload() กดโหลดใหม่ได้
 */
export function usePetDetail(petId: number | null) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<PetFormValues | null>(null);

  const fetchData = useCallback(async () => {
    // ถ้าไม่มี petId ให้เคลียร์ state แล้วจบ
    if (!petId || !Number.isFinite(petId)) {
      setIsLoading(false);
      setError(null);
      setValues(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const pet = await petService.fetchPet(petId); // ถ้า backend รองรับ signal ค่อยส่ง { signal: controller.signal }
      if (controller.signal.aborted) return;
      setValues(petResponseToFormValues(pet));
    } catch (err) {
      if (controller.signal.aborted) return;
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }

    // คืนฟังก์ชันยกเลิกสำหรับ caller ที่อยากยกเลิกเอง (ภายใน hook เราใช้ใน useEffect)
    return () => controller.abort();
  }, [petId]);

  // โหลดเมื่อ petId เปลี่ยน
  useEffect(() => {
    let cancel: void | (() => void);
    (async () => {
      cancel = await fetchData();
    })();
    return () => {
      if (typeof cancel === "function") cancel();
    };
  }, [fetchData]);

  return {
    isLoading,
    error,
    values,
    hasData: !!values && !isLoading && !error,
    reload: fetchData,
    setValues, // เผื่อปรับค่าฟอร์มชั่วคราวก่อนส่ง
  };
}