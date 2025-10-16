"use client";

import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
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

// ---------- Helpers ----------
function extractErrorMessage(err: unknown) {
  const axErr = err as AxiosError<ApiErrorBody>;
  const details = axErr?.response?.data?.details;
  const zodMsg = details
    ? Object.values(details.fieldErrors ?? {}).flat().join(" | ")
    : axErr?.response?.data?.error;

  return zodMsg || axErr?.message || "Unknown error";
}

function isSameRangeByDayAndTime(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return (
    aStart.getTime() === bStart.getTime() &&
    aEnd.getTime() === bEnd.getTime()
  );
}

// overlap (มีช่วงเวลาทับกัน)
function isOverlapped(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

// ---------- Hook ----------
type UseBookingActionsArgs = {
  userId: number;
  selectedBooking: BookingCardProps | null;
  currentBookings: BookingCardProps[]; // ✅ เพิ่มเข้ามาเพื่อเช็คชน
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
  currentBookings,
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
      toast.error("Please provide more details. Title must be ≥ 5 characters and description ≥ 10 characters.");
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
        toast.success("Report sent successfully!");
        setOpenReport(false);
      }
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      console.error("❌ Report error:", msg);
      toast.error(msg || "Failed to send the report. Please try again later.");
    }
  };

  const handleReviewSubmit = async (data: { rating: number; review: string }) => {
    if (!selectedBooking || !userId) return;

    const rating = Number(data.rating);
    const comment = data.review.trim();
    if (rating < 1 || comment.length < 5) {
      toast.error("Please complete your review. Minimum 1 star and at least 5 characters.");
      return;
    }

    try {
      const sitterId = selectedBooking.sitterId ?? null;
      if (sitterId == null) {
        toast.error("Could not find the sitter ID for this booking.");
        return;
      }

      const payload: ReviewPayload = { sitterId, userId, rating, comment };
      const res = await axios.post("/api/bookings/review", payload);
      if (res.status === 201) {
        toast.success("Your review has been submitted. Thank you!");

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
      toast.error(msg || "Failed to submit the review. Please try again.");
    }
  };

  const handleChangeDate = async (bookingId: number, newStart: Date, newEnd: Date) => {
    try {
      if (!selectedBooking) return;

      // A) same as current booking's original range?
      const curStart = new Date(selectedBooking.dateStart!);
      const curEnd = new Date(selectedBooking.dateEnd!);

      if (isSameRangeByDayAndTime(newStart, newEnd, curStart, curEnd)) {
        toast.error("You selected the same date and time as the current booking.", { icon: "⚠️" });
        return;
      }

      // B) overlap with user's other bookings? (exclude this booking id)
      const hasOverlap = currentBookings.some((b) => {
        if (b.id === bookingId) return false;
        const s = new Date(b.dateStart!);
        const e = new Date(b.dateEnd!);
        return isOverlapped(newStart, newEnd, s, e);
      });

      if (hasOverlap) {
        toast.error("This time range overlaps with another booking.", { icon: "⚠️" });
        return;
      }

      // proceed to API
      const payload: ChangeDatePayload = {
        bookingId,
        date_start: newStart,
        date_end: newEnd,
      };
      const res = await axios.put("/api/bookings/change-date", payload);

      if (res.status === 200) {
        toast.success("Booking date and time were updated successfully.");

        // update list
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

        // update selected
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
      toast.error(msg || "Failed to update the booking date. Please try again.");
    }
  };

  return { handleReportSubmit, handleReviewSubmit, handleChangeDate };
}
