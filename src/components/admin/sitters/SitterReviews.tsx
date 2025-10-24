import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Pagination } from "@/components/pagination/Pagination";
import { PaginationInfo } from "@/components/pagination/PaginationInfo";
import { PetPawLoadingSmall } from "@/components/loading/PetPawLoadingSmall";
import { Trash2 } from "lucide-react";
import ConfirmDeleteModal from "@/components/modal/ConfirmDeleteModal";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    id: number;
    name: string | null;
    profile_image: string | null;
  };
}

interface SitterReviewsProps {
  reviews: Review[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  itemsPerPage: number;
  onDelete: (reviewId: number) => void;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < rating ? "text-green-500 fill-green-500" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default function SitterReviews({
  reviews,
  loading,
  totalPages,
  currentPage,
  onPageChange,
  totalRecords,
  itemsPerPage,
  onDelete,
}: SitterReviewsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const handleDeleteClick = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedReviewId) {
      onDelete(selectedReviewId);
    }
    setIsDeleteModalOpen(false);
    setSelectedReviewId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <PetPawLoadingSmall message="Loading Reviews" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-ink mb-2">No Reviews Found</h3>
        <p className="text-xl text-muted-text">
          This pet sitter has no reviews yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-2 md:gap-8 border-b-2 border-gray-300 pb-8 pt-8 last:border-b-0 last:pb-0"
          >
            {/* Left: avatar + name + date */}
            <div className="flex items-center md:items-start gap-5">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={review.user.profile_image || undefined}
                  alt={review.user.name || "User"}
                />
                <AvatarFallback>
                  {review.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate max-w-[180px]">
                  {review.user.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Right: stars + content + delete button */}
            <div className="relative">
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} />
                <button
                  onClick={() => handleDeleteClick(review.id)}
                  className="p-2 rounded-full border border-border text-gray-500 bg-gray-100 hover:text-red hover:bg-red-bg transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 leading-relaxed text-gray-700">
                {review.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-10">
           <PaginationInfo
              currentCount={reviews.length}
              totalCount={totalRecords}
              currentPage={currentPage}
              totalPages={totalPages}
              limit={itemsPerPage}
            />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onClick={onPageChange}
          />
        </div>
      )}

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Confirmation"
        description="Are you sure to delete this review?"
      />
    </div>
  );
}
