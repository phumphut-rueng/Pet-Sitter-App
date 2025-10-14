"use client";
import Image from "next/image";
import AlertConfirm from "./AlertConfirm";
import PrimaryButton from "../buttons/PrimaryButton";
import { toast } from "sonner"; 

interface ReviewSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { name: string; avatarUrl: string };
  data: { rating: number; review: string; date: string } | null;
}

export default function ReviewSummaryDialog({
  open,
  onOpenChange,
  user,
  data,
}: ReviewSummaryDialogProps) {
  if (!data) return null;

  const handleClose = () => {
    toast.success("Review submitted successfully 🎉", {
      description: "Thank you for sharing your feedback.",
      duration: 3000,
      position: "bottom-right",
      className:
        "bg-green-50 border border-green-300 text-green-800 shadow-md rounded-xl px-4 py-3",
    });
    onOpenChange(false);
  };

  return (
    <AlertConfirm
      open={open}
      onOpenChange={onOpenChange}
      width={700}
      maxWidth="90vh"
      title="Your Rating and Review"
      description={
        <div className="pl-5 pr-4 pb-6 text-[16px]">
          <div className="flex items-center justify-between mb-8 mt-8">
            {/* user info */}
            <div className="flex items-center gap-3">
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={56}
                height={56}
                className="rounded-full"
              />
              <div>
                <p className="text-lg font-medium text-ink">{user.name}</p>
                <p className="text-sm font-medium text-gray-6">{data.date}</p>
              </div>
            </div>

            {/* stars */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Image
                  key={star}
                  src={
                    star <= data.rating
                      ? "/icons/BigGreenRatingStar.svg"
                      : "/icons/BigGrayRatingStar.svg"
                  }
                  alt="star"
                  width={20}
                  height={20}
                />
              ))}
            </div>
          </div>

          {/* review text */}
          <p className="text-gray-6 border-t border-gray-200 pt-10 mt-8">
            {data.review}
          </p>

          {/* button */}
          <div className="flex justify-center mt-20">
            <PrimaryButton
              text="View Pet Sitter"
              bgColor="secondary"
              textColor="orange"
              onClick={handleClose}
            />
          </div>
        </div>
      }
    />
  );
}
