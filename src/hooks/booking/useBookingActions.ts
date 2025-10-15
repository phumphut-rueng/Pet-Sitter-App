"use client";

import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import {
  calcDuration,
  formatBookingDateRange,
} from "@/lib/utils/booking-helpers";
import type { BookingCardProps } from "@/components/cards/BookingCard";

// ---------- Types ----------
type ReportPayload = {
  userId: number;
  sitterId: number | null;
  title: string;
  description: string;
};

type ReviewPayload = {
  sitterId: number;
  userId: number;
  rating: number;
  comment: string;
};

type ChangeDatePayload = {
  bookingId: number;
  date_start: string | Date;
  date_end: string | Date;
};

type ApiErrorBody = {
  error?: string;
  details?: {
    fieldErrors?: Record<string, string[]>;
  };
};

// Helper: ดึงข้อความ error แบบปลอดภัย
function extractErrorMessage(err: unknown) {
  const axErr = err as AxiosError<ApiErrorBody>;
  const details = axErr?.response?.data?.details;
  const zodMsg = details
    ? Object.values(details.fieldErrors ?? {}).flat().join(" | ")
    : axErr?.response?.data?.error;

  return zodMsg || axErr?.message || "Unknown error";
}

// ---------- Hook ----------
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
      const payload: ReportPayload = {
        userId,
        sitterId: selectedBooking.sitterUserId ?? null,
        title,
        description,
      };
      const res = await axios.post("/api/bookings/report", payload);
      if (res.status === 201) {
        toast.success("Report sent successfully!", {
          description: "Our team will review your report shortly.",
          duration: 3000,
          position: "bottom-right",
        });
        setOpenReport(false);
      }
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      console.error("❌ Report error:", msg);
      toast.error("Failed to send report", {
        description: msg || "Please try again later.",
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

      const payload: ReviewPayload = { sitterId, userId, rating, comment };
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
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      console.error("❌ Review error:", msg);
      toast.error("ส่งรีวิวไม่สำเร็จ", {
        description: msg || "โปรดลองอีกครั้ง",
        position: "bottom-right",
      });
    }
  };

  const handleChangeDate = async (bookingId: number, newStart: Date, newEnd: Date) => {
    try {
      const payload: ChangeDatePayload = {
        bookingId,
        date_start: newStart,
        date_end: newEnd,
      };
      const res = await axios.put("/api/bookings/change-date", payload);

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
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      console.error("❌ Change date error:", msg);
      toast.error("Change date failed", {
        description: msg || "Failed to update booking date",
        position: "bottom-right",
      });
    }
  };

  return { handleReportSubmit, handleReviewSubmit, handleChangeDate };
}
