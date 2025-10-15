"use client";

import axios from "axios";
import { toast } from "sonner";
import {
  calcDuration,
  formatBookingDateRange,
} from "@/lib/utils/booking-helpers";
import type { BookingCardProps } from "@/components/cards/BookingCard";

type UseBookingActionsArgs = {
  userId: number;
  selectedBooking: BookingCardProps | null;
  setBookings: React.Dispatch<React.SetStateAction<BookingCardProps[]>>;
  setOpenReport: (v: boolean) => void;
  setOpenReview: (v: boolean) => void;
  setReviewData: (v: { rating: number; review: string; date: string } | null) => void;
  setOpenSummary: (v: boolean) => void;
  setOpenChangeDialog: (v: boolean) => void;
  setSelectedBooking: React.Dispatch<React.SetStateAction<BookingCardProps | null>>;
};

export function useBookingActions({
  userId,
  selectedBooking,
  setBookings,
  setOpenReport,
  setOpenReview,
  setReviewData,
  setOpenSummary,
  setOpenChangeDialog,
  setSelectedBooking,
}: UseBookingActionsArgs) {
  const handleReportSubmit = async (data: { issue: string; description: string }) => {
    if (!selectedBooking || !userId) return;

    const title = data.issue.trim();
    const description = data.description.trim();
    if (title.length < 5 || description.length < 10) {
      toast.error("Please provide more detail", {
        description: "Title ≥ 5 ตัวอักษร และ Description ≥ 10 ตัวอักษร",
        position: "bottom-right",
      });
      return;
    }

    try {
      const sitterUserId = selectedBooking.sitterUserId ?? null;
      const payload = { userId, sitterId: sitterUserId, title, description };
      const res = await axios.post("/api/bookings/report", payload);
      if (res.status === 201) {
        toast.success("Report sent successfully!", {
          description: "Our team will review your report shortly.",
          duration: 3000,
          position: "bottom-right",
        });
        setOpenReport(false);
      }
    } catch (error: any) {
      const details = error?.response?.data?.details;
      const zodMsg = details
        ? Object.values(details.fieldErrors || {}).flat().join(" | ")
        : error?.response?.data?.error;

      console.error("❌ Report error:", error?.response?.data || error);
      toast.error("Failed to send report", {
        description: zodMsg || "Please try again later.",
        duration: 3000,
        position: "bottom-right",
      });
    }
  };

  const handleReviewSubmit = async (data: { rating: number; review: string }) => {
    if (!selectedBooking || !userId) return;

    const rating = Number(data.rating);
    const comment = data.review.trim();
    if (rating < 1 || comment.length < 5) {
      toast.error("กรุณากรอกข้อมูลรีวิวให้ครบ", {
        description: "ให้คะแนนอย่างน้อย 1 ดาว และรีวิวอย่างน้อย 5 ตัวอักษร",
        position: "bottom-right",
      });
      return;
    }

    try {
      const sitterId = selectedBooking.sitterId ?? null;
      if (sitterId == null) {
        toast.error("ไม่พบรหัส Sitter จากรายการจองนี้", { position: "bottom-right" });
        return;
      }

      const payload = { sitterId, userId, rating, comment };
      const res = await axios.post("/api/bookings/review", payload);
      if (res.status === 201) {
        toast.success("ส่งรีวิวเรียบร้อย!", {
          description: "ขอบคุณสำหรับคำติชมของคุณ",
          position: "bottom-right",
        });

        setOpenReview(false);
        setReviewData({
          rating,
          review: comment,
          date: new Date().toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        });
        setOpenSummary(true);
      }
    } catch (error: any) {
      const details = error?.response?.data?.details;
      const zodMsg = details
        ? Object.values(details.fieldErrors || {}).flat().join(" | ")
        : error?.response?.data?.error;

      console.error("❌ Review error:", error?.response?.data || error);
      toast.error("ส่งรีวิวไม่สำเร็จ", {
        description: zodMsg || "โปรดลองอีกครั้ง",
        position: "bottom-right",
      });
    }
  };

  const handleChangeDate = async (bookingId: number, newStart: Date, newEnd: Date) => {
    try {
      const res = await axios.put("/api/bookings/change-date", {
        bookingId,
        date_start: newStart,
        date_end: newEnd,
      });

      if (res.status === 200) {
        toast.success("Changed date success 🎉", {
          description: "Your booking date and time have been updated.",
          duration: 3000,
          position: "bottom-right",
        });

        // อัปเดต list ทั้งหมด
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  dateStart: newStart.toISOString(),
                  dateEnd: newEnd.toISOString(),
                  dateTime: formatBookingDateRange(
                    newStart.toISOString(),
                    newEnd.toISOString()
                  ),
                  duration: calcDuration(newStart.toISOString(), newEnd.toISOString()),
                }
              : b
          )
        );

        // อัปเดตตัวที่ถูกเลือกอยู่
        setSelectedBooking((prev) =>
          prev
            ? {
                ...prev,
                dateStart: newStart.toISOString(),
                dateEnd: newEnd.toISOString(),
                dateTime: formatBookingDateRange(
                  newStart.toISOString(),
                  newEnd.toISOString()
                ),
                duration: calcDuration(newStart.toISOString(), newEnd.toISOString()),
              }
            : prev
        );

        setOpenChangeDialog(false);
      }
    } catch (err: any) {
      console.error("❌ Change date error:", err);
      const msg = err?.response?.data?.error || "Failed to update booking date";
      toast.error("Change date failed", {
        description: msg,
        position: "bottom-right",
      });
    }
  };

  return { handleReportSubmit, handleReviewSubmit, handleChangeDate };
}
