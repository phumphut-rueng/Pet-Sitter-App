
"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  formatDate,
  formatBookingDateRange,
  calcDuration,
  mapStatus,
} from "@/lib/utils/booking-helpers";
import type { BookingCardProps } from "@/components/cards/BookingCard";

type UseBookingHistory = {
  bookings: BookingCardProps[];
  loading: boolean;
  error: string | null;
  setBookings: React.Dispatch<React.SetStateAction<BookingCardProps[]>>;
  refresh: () => Promise<void>;
};

export function useBookingHistory(userId: number | null): UseBookingHistory {
  const [bookings, setBookings] = useState<BookingCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get("/api/bookings/history", {
        params: { userId },
      });
      const data = res.data.bookings;

      const formatted: BookingCardProps[] = data.map((b: any) => ({
        id: b.id,
        status: mapStatus(b.status, b.paymentStatus),
        title: b.sitterName || "Pet Sitter",
        sitterName: b.sitterName || "-",
        avatarUrl: b.sitterAvatar,
        transactionDate: formatDate(b.transactionDate),
        dateTime: formatBookingDateRange(b.dateStart, b.dateEnd),
        duration: calcDuration(b.dateStart, b.dateEnd),
        pet: b.pets.map((p: any) => p.name).join(", "),
        successDate: b.status?.toLowerCase().includes("success")
          ? formatDate(b.dateEnd)
          : undefined,
        canceledReason: b.status?.toLowerCase().includes("cancel")
          ? b.note || "Canceled by system"
          : undefined,

        // เพิ่มเพื่อใช้งานใน dialog
        sitterId: b.sitterId,
        sitterUserId: b.sitterUserId,
        dateStart: b.dateStart,
        dateEnd: b.dateEnd,
      }));

      setBookings(formatted);
      setError(null);
    } catch (err: any) {
      console.error("❌ Fetch booking history error:", err);
      setError("Failed to load booking history.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    setBookings,
    refresh: fetchBookings,
  };
}
