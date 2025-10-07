import { useEffect, useState } from "react";
import type { OwnerRow, OwnerListResponse } from "@/types/admin/owners";
import { api } from "@/lib/api/axios";
import { isAxiosError } from "axios";

type StatusFilter = "all" | "ACTIVE" | "SUSPENDED";
type Params = { page?: number; limit?: number; q?: string; status?: StatusFilter };

/**
 * กำหนดโครงสร้าง error payload ที่ backend อาจส่งกลับมา
 */
type ApiErrorPayload = { message?: string; error?: string };

/**
 * แปลง axios error เป็น error message อย่างปลอดภัย
 * 
 * รองรับ AxiosError และ error types อื่นๆ

 */
function toErrorMessage(e: unknown): string {
  if (isAxiosError(e)) {
    const d = e.response?.data as unknown as ApiErrorPayload | undefined;
    // แก้จาก "Failed to fetch owners" เป็น "Failed to load owners"
    return d?.error || d?.message || e.message || "Failed to load owners";
  }
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    // แก้จาก "Failed to fetch owners" เป็น "Failed to load owners"
    return "Failed to load owners";
  }
}

/**
 * Custom Hook: useOwnersQuery
 * 
 * ดึงรายการ owners จาก API ด้วย axios.get()
 * พร้อมรองรับ pagination, search, และ filter ตามสถานะ
 * 
 * Features:
 * - ใช้ axios.get() เรียก API (ไม่ใช่ fetch API)
 * - รองรับ AbortController สำหรับ cancel requests
 * - Auto-refetch เมื่อ params เปลี่ยน
 * - Error handling แบบ type-safe
 * 
 * @param page - หน้าปัจจุบัน (default: 1)
 * @param limit - จำนวนรายการต่อหน้า (default: 10)
 * @param q - คำค้นหา (default: "")
 * @param status - กรองตามสถานะ (default: "all")
 */
export function useOwnersQuery({ page = 1, limit = 10, q = "", status = "all" }: Params) {
  const [data, setData] = useState<OwnerListResponse | null>(null);
  const [items, setItems] = useState<OwnerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   *  โหลดข้อมูล owners เมื่อ params เปลี่ยน
   * ใช้ axios.get() เรียก API endpoint
   */
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        // ใช้ axios.get() เรียก API (ไม่ใช่ fetch API)
        const { data } = await api.get<OwnerListResponse>(
          "/api/admin/owners/get-owners",
          {
            params: {
              page,
              limit,
              q: q.trim(),
              status, // filter ตามสถานะ
            },
            signal: controller.signal, // รองรับการ cancel request
          }
        );

        // ป้องกัน set state หลัง component unmount
        if (cancelled) return;
        
        setData(data);
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        
      } catch (e) {
        // ถ้า request ถูก cancel ไม่ต้อง set error
        if (cancelled || controller.signal.aborted) return;
        setError(toErrorMessage(e));
        
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // Cleanup: cancel axios request เมื่อ component unmount
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, limit, q, status]);

  return {
    data,           // ข้อมูลเต็มจาก API
    items,          // รายการ owners
    total,          // จำนวนทั้งหมด
    page,           // หน้าปัจจุบัน
    limit,          // จำนวนต่อหน้า
    loading,        // สถานะกำลังโหลด
    error,          // ข้อความ error (ถ้ามี)
    totalPages: Math.max(1, Math.ceil(total / limit)), // จำนวนหน้าทั้งหมด
  };
}