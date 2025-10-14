import * as React from "react";
import Image from "next/image";
import type { OwnerReviewsListProps, ReviewItem } from "@/types/admin/owners";

type StarRatingProps = {
  rating: number;
};

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const totalStars = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex gap-1" role="img" aria-label={`${totalStars} stars`}>
      {Array.from({ length: totalStars }).map((_, index) => (
        <Image
          key={index}
          src="/icons/Rating-Star.svg"
          alt=""
          width={20}
          height={20}
          className="h-[20px] w-[20px] fill-green text-green rounded-[1px]"
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

function formatReviewDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type SitterAvatarProps = {
  avatarUrl: string | null;
  name: string;
};

const SitterAvatar: React.FC<SitterAvatarProps> = ({ avatarUrl, name }) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-2">
      {avatarUrl ? (
        <Image src={avatarUrl} alt={name} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-orange-1 text-brand font-semibold text-lg">
          {initial}
        </div>
      )}
    </div>
  );
};

type ReviewCardProps = {
  review: ReviewItem;
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <article className="border-b border-gray-2 py-6 ">
      <div className="flex">
        <SitterAvatar avatarUrl={review.sitter.avatarUrl} name={review.sitter.name} />
        <div className="mx-4">
          <h3 className="text-base-medium text-ink">
            {review.sitter.name}
          </h3>
          <time
            className="text-sm2-medium text-gray-6"
            dateTime={review.createdAt}
          >
            {formatReviewDate(review.createdAt)}
          </time>
        </div>

        <div>
          <div className="mb-[16px]">
            <StarRating rating={review.rating} />
          </div>

          {review.comment && (
            <div className="flex justify-center">
              <p className="text-sm2-medium text-gray-7">
                {review.comment}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="px-10 py-10 bg-white rounded-2xl rounded-tl-none" role="status" aria-label="Loading reviews">
    <div className="animate-pulse space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="h-14 w-14 rounded-full bg-gray-2" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-2" />
            <div className="h-4 w-24 rounded bg-gray-2" />
            <div className="h-16 w-full rounded bg-gray-2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="px-10 py-10 bg-white rounded-2xl rounded-tl-none">
    <div className="rounded-lg border border-dashed border-border bg-white p-12 text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <p className="mt-4 text-ink font-medium">No reviews yet</p>
      <p className="mt-1 text-sm text-gray-6">
        This owner hasn&apos;t received any reviews from sitters
      </p>
    </div>
  </div>
);

type ErrorStateProps = {
  message: string;
};

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => (
  <div className="px-10 py-10 bg-white rounded-2xl rounded-tl-none" role="alert">
    <div className="rounded-lg border border-red bg-pink-bg p-6 text-center">
      <p className="text-red font-medium">{message}</p>
    </div>
  </div>
);

export default function OwnerReviewsList({
  reviews,
  loading,
  error,
}: OwnerReviewsListProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!reviews || reviews.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="px-10 py-10 bg-white rounded-2xl rounded-tl-none">
      <div className="space-y-0">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}