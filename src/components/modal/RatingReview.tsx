// src/components/modal/RatingReviewDialog.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import AlertConfirm from "./AlertConfirm";
import PrimaryButton from "../buttons/PrimaryButton";

// ---------- Responsive Star Component ----------
function ResponsiveStar({ isActive }: { isActive: boolean }) {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsSmall(window.innerWidth <= 375);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const size = isSmall ? 46 : 60;

  return (
    <Image
      src={
        isActive
          ? "/icons/BigGreenRatingStar.svg"
          : "/icons/BigGrayRatingStar.svg"
      }
      alt={isActive ? "Active Star" : "Inactive Star"}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="object-contain"
      priority
    />
  );
}

// ---------- Main Dialog ----------
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
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth <= 375;

  return (
    <AlertConfirm
      open={open}
      onOpenChange={onOpenChange}
      title="Rating & Review"
      width={750}
      maxWidth="95vw"
      description={
        <AlertDialogDescription asChild>
          <div className="p-4 md:p-6 text-center space-y-6 md:space-y-8">
            {/* ---------- Rating Section ---------- */}
            <div>
              <h3 className="text-[20px] md:text-[24px] font-bold text-ink mb-4 md:mb-6">
                What is your rate?
              </h3>
              <div className="flex justify-center flex-wrap gap-3 md:gap-5 mb-10 md:mb-20">
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
                      <ResponsiveStar isActive={isActive} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ---------- Review Textarea ---------- */}
            <div className="text-left max-w-[600px] mx-auto">
              <h3 className="text-[20px] md:text-[24px] font-bold text-ink mb-4 md:mb-6 text-center md:text-left">
                Share more about your experience
              </h3>
              <textarea
                rows={isSmallScreen ? 6 : 10}
                placeholder="Your review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full border border-gray-2 rounded-lg p-3 md:p-4 font-semibold text-[16px] md:text-[17px] placeholder:text-gray-5 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
              />
            </div>

            {/* ---------- Buttons ---------- */}
            <div className="flex flex-col-reverse md:flex-row justify-center md:justify-between items-center gap-3 md:gap-6 mt-10 md:mt-14">
              <PrimaryButton
                text="Cancel"
                bgColor="secondary"
                textColor="orange"
                onClick={() => onOpenChange(false)}
                className="w-full md:w-auto px-8"
              />
              <PrimaryButton
                text="Send Review & Rating"
                bgColor="primary"
                textColor="white"
                onClick={() => onSubmit({ rating, review })}
                disabled={rating < 1 || review.trim().length < 5}
                className="w-full md:w-auto px-8"
              />
            </div>
          </div>
        </AlertDialogDescription>
      }
    />
  );
}
