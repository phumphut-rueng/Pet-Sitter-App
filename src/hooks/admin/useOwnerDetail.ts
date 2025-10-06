import * as React from "react";
import type { OwnerDetail } from "@/types/admin/owners";

export function useOwnerDetail(id?: string) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [owner, setOwner] = React.useState<OwnerDetail | null>(null);
  const [tab, setTab] = React.useState<"profile" | "pets" | "reviews">("profile");

  // เก็บ AbortController ตัวล่าสุดไว้ยกเลิกโหลดเก่า ๆ
  const controllerRef = React.useRef<AbortController | null>(null);

  const refetch = React.useCallback(async () => {
    if (!id) return;

    // ยกเลิกคำขอก่อนหน้า (ถ้ามี)
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/owners/get-owner-by-id?id=${id}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(await res.text());
      const json: OwnerDetail = await res.json();
      setOwner(json);
    } catch (e: unknown) {
      // ถ้าเป็นการยกเลิก ไม่ต้องตั้ง error
      if ((e as any)?.name === "AbortError") return;
      const msg = e instanceof Error ? e.message : String(e ?? "Failed to load");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // โหลดครั้งแรก/เมื่อ id เปลี่ยน
  React.useEffect(() => {
    if (!id) return;
    refetch();
    return () => controllerRef.current?.abort();
  }, [id, refetch]);

  // helper: สถานะ suspend (ใช้ในปุ่ม/แบดจ์)
  const isSuspended = React.useMemo(
    () =>
      owner?.status
        ? owner.status === "SUSPENDED"
        : Boolean(owner?.suspended_at),
    [owner?.status, owner?.suspended_at]
  );

  return {
    loading,
    error,
    owner,
    setOwner,   // เผื่อออปติไมซ์ติคอัพเดต
    tab,
    setTab,
    refetch,    // เรียกหลัง ban/unban เพื่อ sync ข้อมูลจากเซิร์ฟเวอร์
    isSuspended,
  };
}