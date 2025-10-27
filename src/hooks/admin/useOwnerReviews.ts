import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/utils/error";
import type { ReviewItem } from "@/types/admin/owners";

type ReviewResponse = {
  data: ReviewItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    averageRating: string;
  };
};

export type UseOwnerReviewsReturn = {
  loading: boolean;
  error: string | null;
  reviews: ReviewItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    averageRating: string;
  };
  /** รีเฟรชหน้าปัจจุบัน หรือไปหน้าที่ระบุ */
  refetch: (page?: number) => Promise<void>;
  /** สั่งเปลี่ยนหน้า */
  setPage: (page: number) => void;
  /** ลัดไปหน้าถัดไป/ก่อนหน้า */
  nextPage: () => void;
  prevPage: () => void;
};

export function useOwnerReviews(
  ownerId: string | undefined,
  defaultPageSize = 10
): UseOwnerReviewsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
    averageRating: "0.00",
  });
  const [refreshTick, setRefreshTick] = useState(0);

  // รีเซ็ตเมื่อ ownerId หรือ pageSize เปลี่ยน
  useEffect(() => {
    setReviews([]);
    setMeta((m) => ({
      ...m,
      page: 1,
      pageSize: defaultPageSize,
      total: 0,
      averageRating: "0.00",
    }));
    setError(null);
  }, [ownerId, defaultPageSize]);

  // โหลดข้อมูลเมื่อ ownerId / page / pageSize / refreshTick เปลี่ยน
  useEffect(() => {
    if (!ownerId) return;

    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<ReviewResponse>(
          `/admin/owners/${ownerId}/reviews`,
          {
            params: { page: meta.page, pageSize: meta.pageSize },
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;

        setReviews(data.data ?? []);
        setMeta({
          page: data.meta?.page ?? meta.page,
          pageSize: data.meta?.pageSize ?? meta.pageSize,
          total: data.meta?.total ?? 0,
          averageRating: data.meta?.averageRating ?? "0.00",
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err, "Failed to load reviews"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [ownerId, meta.page, meta.pageSize, refreshTick]);

  const setPage = useCallback((page: number) => {
    if (page < 1) page = 1;
    const totalPages = Math.max(1, Math.ceil((meta.total || 0) / meta.pageSize));
    if (page > totalPages) page = totalPages;
    setMeta((m) => ({ ...m, page }));
  }, [meta.total, meta.pageSize]);

  const nextPage = useCallback(() => {
    const totalPages = Math.max(1, Math.ceil((meta.total || 0) / meta.pageSize));
    if (meta.page < totalPages) setMeta((m) => ({ ...m, page: m.page + 1 }));
  }, [meta.page, meta.total, meta.pageSize]);

  const prevPage = useCallback(() => {
    if (meta.page > 1) setMeta((m) => ({ ...m, page: m.page - 1 }));
  }, [meta.page]);

  const refetch = useCallback(async (page?: number) => {
    if (page && page !== meta.page) {
      setPage(page); // จะไปโหลดเองใน useEffect
    } else {
      setRefreshTick((t) => t + 1); // โหลดหน้าเดิมใหม่
    }
  }, [meta.page, setPage]);

  return {
    loading,
    error,
    reviews,
    meta,
    refetch,
    setPage,
    nextPage,
    prevPage,
  };
}