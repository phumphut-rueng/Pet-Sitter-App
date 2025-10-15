// src/components/modal/RatingReviewDialog.tsx
import { useState } from "react";
import Image from "next/image";
import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import AlertConfirm from "./AlertConfirm";
import PrimaryButton from "../buttons/PrimaryButton";

interface RatingReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { rating: number; review: string }) => void;
}

export default function RatingReviewDialog({
  open,
  onOpenChange,
  onSubmit,
}: RatingReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");

  const stars = [1, 2, 3, 4, 5];

  return (
    <AlertConfirm
      open={open}
      onOpenChange={onOpenChange}
      title="Rating & Review"
      width={750}
      maxWidth="90vw"
      description={
        <AlertDialogDescription asChild>
          <div className="p-6 text-center space-y-8">
            {/* Rating Section */}
            <div>
              <h3 className="text-[24px] font-bold text-ink mb-6">
                What is your rate?
              </h3>
              <div className="flex justify-center gap-4 mb-20">
                {stars.map((star) => {
                  const isActive = star <= (hovered || rating);
                  return (
                    <button
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(rating === star ? 0 : star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Image
                        src={
                          isActive
                            ? "/icons/BigGreenRatingStar.svg"
                            : "/icons/BigGrayRatingStar.svg"
                        }
                        alt={isActive ? "Active Star" : "Inactive Star"}
                        width={60}
                        height={60}
                        priority
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Textarea */}
            <div>
              <h3 className="text-[24px] font-bold text-ink mb-6">
                Share more about your experience
              </h3>
              <textarea
                rows={10}
                placeholder="Your review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full border border-gray-2 rounded-md p-3 font-semibold text-[17px] placeholder:text-[18px] placeholder:text-gray-5 focus:outline-none focus:ring-0 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-14">
              <PrimaryButton
                text="Cancel"
                bgColor="secondary"
                textColor="orange"
                onClick={() => onOpenChange(false)}
              />
              <PrimaryButton
  text="Send Review&Rating"
  bgColor="primary"
  textColor="white"
  onClick={() => {
    onSubmit({ rating, review });
  }}
  disabled={rating < 1 || review.trim().length < 5}
/>
            </div>
          </div>
        </AlertDialogDescription>
      }
    />
  );
}
