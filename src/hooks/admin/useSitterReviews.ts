import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { AdminSitterService } from "@/lib/services/adminSitterService";
import type { Review } from "@/types/admin";

export function useSitterReviews(id: string | string[] | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewTotalRecords, setReviewTotalRecords] = useState(0);

  const reviewsPerPage = 5;

  const fetchReviews = useCallback(async (page = 1) => {
    if (!id) return;
    
    try {
      setLoadingReviews(true);
      const resp = await AdminSitterService.getReviews({
        sitterId: Array.isArray(id) ? id[0] : id,
        page,
        limit: reviewsPerPage,
      });
      setReviews(resp?.data ?? []);
      setReviewTotalPages(resp?.pagination?.totalPages ?? 1);
      setReviewTotalRecords(resp?.pagination?.totalRecords ?? 0);
      setReviewCurrentPage(page);
    } catch (e) {
      console.error("Error fetching reviews:", e);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [id]);

  const handleDeleteReview = useCallback(async (reviewId: number) => {
    try {
      const result = await toast.promise(
        AdminSitterService.deleteReview(reviewId),
        {
          loading: "Deleting review...",
          success: "Review deleted successfully!",
          error: "Failed to delete review.",
        }
      );

      if (result) {
        // Refresh reviews
        fetchReviews(reviewCurrentPage);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  }, [fetchReviews, reviewCurrentPage]);

  return {
    reviews,
    loadingReviews,
    reviewCurrentPage,
    reviewTotalPages,
    reviewTotalRecords,
    reviewsPerPage,
    fetchReviews,
    handleDeleteReview,
  };
}
