import { useState, useEffect } from "react";
import { api } from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/api/api-utils";
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
  refetch: (page?: number) => Promise<void>;
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

  useEffect(() => {
    if (!ownerId) {
      setReviews([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api.get<ReviewResponse>(`/admin/owners/${ownerId}/reviews`, {
      params: { page: 1, pageSize: defaultPageSize }
    })
    .then(({ data }) => {
      if (cancelled) return;
      
      setReviews(data.data ?? []);
      setMeta({
        page: data.meta?.page ?? 1,
        pageSize: data.meta?.pageSize ?? defaultPageSize,
        total: data.meta?.total ?? 0,
        averageRating: data.meta?.averageRating ?? "0.00",
      });
      setLoading(false);
    })
    .catch((err) => {
      if (cancelled) return;
      
      setError(getErrorMessage(err, "Failed to load reviews"));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [ownerId, defaultPageSize]);

  const refetch = async (page = 1) => {
    if (!ownerId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get<ReviewResponse>(
        `/admin/owners/${ownerId}/reviews`,
        { params: { page, pageSize: defaultPageSize } }
      );
      
      setReviews(data.data ?? []);
      setMeta({
        page: data.meta?.page ?? page,
        pageSize: data.meta?.pageSize ?? defaultPageSize,
        total: data.meta?.total ?? 0,
        averageRating: data.meta?.averageRating ?? "0.00",
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load reviews"));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    reviews,
    meta,
    refetch,
  };
}