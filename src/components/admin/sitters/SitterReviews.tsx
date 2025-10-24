import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Pagination } from "@/components/pagination/Pagination";
import { PaginationInfo } from "@/components/pagination/PaginationInfo";
import { PetPawLoadingSmall } from "@/components/loading/PetPawLoadingSmall";
import { Trash2, Check } from "lucide-react";

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
          <div key={review.id} className="flex gap-4 border-b pb-6 last:border-b-0 last:pb-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={review.user.profile_image || undefined} alt={review.user.name || "User"} />
              <AvatarFallback>
                {review.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{review.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onDelete(review.id)} className="p-2 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-green-100 text-gray-500 hover:text-green-600 transition-colors">
                        <Check className="h-5 w-5" />
                    </button>
                </div>
              </div>
              <div className="mt-2">
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
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
    </div>
  );
}
