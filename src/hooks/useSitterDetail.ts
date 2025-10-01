import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Sitter, Review } from '@/types/sitter.types';
import { AxiosError } from 'axios';

interface ReviewPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}


export function useSitterDetail(id?: string | string[]) {
  const [sitter, setSitter] = useState<Sitter | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPagination, setReviewPagination] = useState<ReviewPagination>({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSitter = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/sitter/get-sitter-by-id?id=${id}&page=${reviewPagination.page}&limit=${reviewPagination.limit}`
      );
      const data: Sitter = res.data.data;

      setSitter(data);
      setReviews(data.reviews);
      setReviewPagination(data.reviewPagination ?? {
        page: 1,
        limit: 5,
        totalCount: 0,
        totalPages: 0
      });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.error(error);
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }, [id, reviewPagination.page, reviewPagination.limit]);

  useEffect(() => {
    fetchSitter();
  }, [fetchSitter]);

  const handleReviewPageChange = (page: number) => {
    setReviewPagination(prev => ({ ...prev, page }));
  };

  return {
    sitter,
    reviews,
    reviewPagination,
    loading,
    error,
    handleReviewPageChange
  };
}
