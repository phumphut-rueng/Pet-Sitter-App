import Image from "next/image";
import { StarRating } from "./PetSitterCard";
import type { Review } from "@/types/sitter.types";

interface ReviewCardProps {
  reviews: Review[];
}
export default function ReviewsSection({ reviews }: ReviewCardProps) {
  return (
    <div className="divide-y divide-gray-2">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="flex flex-col lg:flex-row space-x-6 p-6 bg-gray-1"
        >
          {/* Left box */}
          <div className="w-56 flex flex-row items-start space-y-2 gap-4">
            {review.user.profile_image ? (
              <div className="w-14 h-14 rounded-full overflow-hidden relative">
                <Image
                  src={review.user.profile_image}
                  alt={review.user.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                {review.user.name.charAt(0)}
              </div>
            )}
            <div className="pt-1">
              <p className="font-medium text-lg text-ink">{review.user.name}</p>
              <p className="font-medium text-sm text-gray-6">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Right box */}
          <div className="flex-1">
            <StarRating value={review.rating} size="md" />
            <p className="mt-3 text-base font-medium text-gray-7 leading-relaxed">
              {review.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
