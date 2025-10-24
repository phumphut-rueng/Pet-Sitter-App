"use client";

import { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  formatDate,
  formatBookingDateRange,
  calcDuration,
  mapStatus,
} from "@/lib/utils/booking-helpers";
import type { BookingCardProps } from "@/components/cards/BookingCard";

/** ---------- API response types ---------- */
type ApiPet = {
  id: number;
  name: string;
  type: string;
};

type BookingApiItem = {
  id: number;
  sitterId: number | null;
  sitterUserId: number | null;
  sitterName: string | null;
  sitterOwnerName: string | null; 
  sitterAvatar: string | null;
  sitterLat: number | null;
  sitterLng: number | null;
  status: string;
  paymentStatus: string | null;
  dateStart: string; // ISO string from API
  dateEnd: string;
  transactionId?: string | null; // ISO string from API
  transactionDate: string | null;
  pets: ApiPet[];
  amount?: number | null;
  paymentType?: string | null;
  note?: string | null;
  userReview: null | {
    rating: number;
    comment: string;
    date: string;
  };
};

type HistoryApiResponse = {
  bookings: BookingApiItem[];
};

type UseBookingHistory = {
  bookings: BookingCardProps[];
  loading: boolean;
  error: string | null;
  setBookings: React.Dispatch<React.SetStateAction<BookingCardProps[]>>;
  refresh: () => Promise<void>;
};

const asNumber = (v: number | null | undefined) =>
  typeof v === "number" && !Number.isNaN(v) ? v : undefined;

export function useBookingHistory(userId: number | null): UseBookingHistory {
  const [bookings, setBookings] = useState<BookingCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);

      const res = await axios.get<HistoryApiResponse>("/api/bookings/history", {
        params: { userId },
      });

      const data = res.data.bookings;

      const formatted: BookingCardProps[] = data.map((b) => ({
        id: b.id,
        status: mapStatus(b.status, b.paymentStatus ?? undefined),
        title: b.sitterName ?? "Pet Sitter",
        sitterName: b.sitterOwnerName ?? "-",
        avatarUrl: b.sitterAvatar ?? undefined,
        transactionDate: formatDate(b.transactionDate ?? null),
        dateTime: formatBookingDateRange(b.dateStart, b.dateEnd),
        duration: calcDuration(b.dateStart, b.dateEnd),
        pet: b.pets.map((p) => p.name).join(", "),
        successDate: b.status.toLowerCase().includes("success")
          ? formatDate(b.dateEnd)
          : undefined,
        canceledReason: b.status.toLowerCase().includes("cancel")
          ? b.note ?? "Canceled by system"
          : undefined,

        // ข้อมูลเพิ่มสำหรับ dialog/การอัปเดต
        sitterId: b.sitterId ?? undefined,
        sitterUserId: b.sitterUserId ?? undefined,
        dateStart: b.dateStart,
        dateEnd: b.dateEnd,

        totalTHB: asNumber(b.amount),
        transactionNo: b.transactionId ?? undefined,

        sitterLat: asNumber(b.sitterLat),
        sitterLng: asNumber(b.sitterLng),

        hasUserReview: !!b.userReview,
        userReview: b.userReview
          ? {
              rating: b.userReview.rating,
              comment: b.userReview.comment,
              date: b.userReview.date,
            }
          : undefined,
      }));

      setBookings(formatted);
      setError(null);
    } catch (err: unknown) {
      const axErr = err as AxiosError<{ error?: string }>;
      console.error(
        "❌ Fetch booking history error:",
        axErr?.response?.data || axErr
      );
      setError(
        axErr?.response?.data?.error ?? "Failed to load booking history."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    setBookings,
    refresh: fetchBookings,
  };
}
