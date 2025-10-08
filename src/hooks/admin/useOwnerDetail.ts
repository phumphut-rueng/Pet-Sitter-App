import * as React from "react";
import type { OwnerDetail } from "@/types/admin/owners";
import { api } from "@/lib/api/axios";
import { isAxiosError, CanceledError } from "axios";

export type Tab = "profile" | "pets" | "reviews";

type UseOwnerDetailOpts = {
  onError?: (msg: string) => void;
};

type UseOwnerDetailReturn = {
  loading: boolean;
  error: string | null;
  owner: OwnerDetail | null;
  setOwner: React.Dispatch<React.SetStateAction<OwnerDetail | null>>;
  tab: Tab;
  setTab: (t: Tab) => void;
  /** 
   * refetch = โหลดข้อมูลใหม่อีกรอบ ด้วย axios.get()
   * หมายเหตุ: ชื่อ "refetch" เป็นแค่ชื่อฟังก์ชัน 
   */
  refetch: () => Promise<void>;
  isSuspended: boolean;
  banOwner: (reason?: string, cascadePets?: boolean) => Promise<void>;
  unbanOwner: () => Promise<void>;
};

/* ----------------------------------------
 * Helper Functions: ตรวจสอบ error แบบ type-safe
 * -------------------------------------- */
type AbortLike = { name?: unknown };
function isAbortErrorLike(e: unknown): boolean {
  return typeof (e as AbortLike)?.name === "string" && (e as { name: string }).name === "AbortError";
}

type ApiErrorPayload = { message?: string; error?: string };

/** ตรวจสอบว่า axios request ถูก cancel หรือไม่ */
function isCanceled(e: unknown, signal?: AbortSignal): boolean {
  return (
    e instanceof CanceledError ||
    (isAxiosError(e) && e.code === "ERR_CANCELED") ||
    (signal?.aborted ?? false) ||
    isAbortErrorLike(e)
  );
}

/** ดึงข้อความ error จาก axios error response */
function getAxiosMessage(e: unknown, fallback = "Failed to load"): string {
  if (isAxiosError(e)) {
    if (!e.response) return "Network error. Please check your connection.";
    const data = e.response.data as unknown as ApiErrorPayload | undefined;
    return data?.message || data?.error || e.response.statusText || e.message || fallback;
  }
  if (e instanceof Error) return e.message || fallback;
  if (typeof e === "string") return e || fallback;
  return fallback;
}

/** 
 * 
 * 
 * จัดการข้อมูล owner โดยใช้ axios ทั้งหมด (ไม่มี fetch API)
 * - โหลดข้อมูล owner จาก API ด้วย axios.get()
 * - รีโหลดข้อมูลใหม่ด้วย axios.get()
 * - แบน/ปลดแบน owner ด้วย axios.post()
 */
export function useOwnerDetail(
  id?: string,
  initialData?: OwnerDetail | null,
  opts?: UseOwnerDetailOpts
): UseOwnerDetailReturn {
  const [owner, setOwner] = React.useState<OwnerDetail | null>(initialData ?? null);
  const [loading, setLoading] = React.useState<boolean>(!!id && !initialData);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<Tab>("profile");

  // เก็บ AbortController เพื่อยกเลิก axios request ที่ค้างอยู่
  const controllerRef = React.useRef<AbortController | null>(null);

  // แสดง error message ที่ได้จาก axios response
  const safeNotifyError = React.useCallback(
    (e: unknown, fallback = "Operation failed") => {
      const msg = getAxiosMessage(e, fallback);
      setError(msg);
      opts?.onError?.(msg);
    },
    [opts]
  );

  /** 
   * loadOwnerData: โหลดข้อมูล owner จาก API ด้วย axios.get()
   * 
   *  หมายเหตุ: ชื่อเดิมคือ "refetch" 
   * - "refetch" = "re" (อีกครั้ง) + "fetch" (ดึงข้อมูล) 
   * - แต่จริงๆ ใช้ axios.get() ไม่ใช่ fetch API 
   * - เป็นแค่ชื่อที่นิยมใช้ใน React ecosystem (เหมือน React Query)
   */
  const loadOwnerData = React.useCallback(async () => {
    if (!id) return;

    // ยกเลิก axios request ก่อนหน้าถ้ามี
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // ใช้ axios.get() เรียก API (ไม่ใช่ fetch)
      const { data } = await api.get<OwnerDetail>("admin/owners/get-owner-by-id", {
        params: { id },
        signal: controller.signal, // ส่ง signal เพื่อให้ยกเลิก request ได้
      });
      setOwner(data);
    } catch (e) {
      // ถ้า axios request ถูก cancel ไม่ต้อง set error
      if (isCanceled(e, controller.signal)) return;
      safeNotifyError(e, "Failed to load owner details");
    } finally {
      setLoading(false);
    }
  }, [id, safeNotifyError]);

  /** 
   *  Auto-load: โหลดข้อมูลอัตโนมัติเมื่อ id เปลี่ยน
   * ใช้ axios.get() ผ่านฟังก์ชัน loadOwnerData
   */
  React.useEffect(() => {
    if (!id) {
      controllerRef.current?.abort();
      setOwner(null);
      setError(null);
      setLoading(false);
      return;
    }
    // เรียก axios.get() ผ่าน loadOwnerData
    loadOwnerData();
    
    // cleanup: ยกเลิก axios request เมื่อ component ถูก unmount
    return () => {
      controllerRef.current?.abort();
    };
  }, [id, loadOwnerData]);

  /** เช็คว่า owner ถูก suspend หรือไม่ */
  const isSuspended = React.useMemo(
    () => (owner?.status ? owner.status === "SUSPENDED" : Boolean(owner?.suspended_at)),
    [owner?.status, owner?.suspended_at]
  );

  /** 
   *  banOwner: แบน owner (และสามารถแบน pets ที่เกี่ยวข้องด้วย)
   * ใช้ axios.post() ส่งคำสั่งแบน
   */
  const banOwner = React.useCallback(
    async (reason?: string, cascadePets = true) => {
      if (!id) return;
      try {
        const currentId = id; // เก็บ id ปัจจุบันป้องกัน race condition
        
        //  ใช้ axios.post() ส่ง request (ไม่ใช่ fetch)
        await api.post(`admin/owners/${currentId}/ban`, {
          action: "ban",
          reason: reason ?? "Violated policy",
          cascadePets,
        });
        
        // โหลดข้อมูลใหม่ด้วย axios.get() ทันทีเพื่ออัพเดทสถานะ
        if (currentId === id) {
          await loadOwnerData();
        }
      } catch (e) {
        safeNotifyError(e, "Failed to suspend owner");
      }
    },
    [id, loadOwnerData, safeNotifyError]
  );

  /** 
   * unbanOwner: ปลดแบน owner
   * ใช้ axios.post() ส่งคำสั่งปลดแบน
   */
  const unbanOwner = React.useCallback(async () => {
    if (!id) return;
    try {
      const currentId = id;
      
      // ใช้ axios.post() ส่ง request (ไม่ใช่ fetch)
      await api.post(`admin/owners/${currentId}/ban`, { action: "unban" });
      
      //  โหลดข้อมูลใหม่ด้วย axios.get() ทันที
      if (currentId === id) {
        await loadOwnerData();
      }
    } catch (e) {
      safeNotifyError(e, "Failed to unsuspend owner");
    }
  }, [id, loadOwnerData, safeNotifyError]);

  return {
    loading,
    error,
    owner,
    setOwner,
    tab,
    setTab,
    // ส่งออกเป็นชื่อ "refetch" ตามมาตรฐานของ React Query/SWR
    // แต่จริงๆ ภายในใช้ axios.get()  (ไม่ใช่ fetch API)
    refetch: loadOwnerData,
    isSuspended,
    banOwner,
    unbanOwner,
  };
}