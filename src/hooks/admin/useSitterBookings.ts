import { useState, useCallback } from "react";
import { AdminSitterService } from "@/lib/services/adminSitterService";
import type { BookingRow } from "@/types/admin";
import type { BookingCardProps, BookingStatus } from "@/components/cards/BookingCard";
import { bookingData } from "@/types/booking.types";

export function useSitterBookings(id: string | string[] | undefined) {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingCurrentPage, setBookingCurrentPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [bookingTotalRecords, setBookingTotalRecords] = useState(0);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isBookingDetailLoading, setIsBookingDetailLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<
    (BookingCardProps & { totalTHB?: number; transactionNo?: string }) | null
  >(null);

  const bookingsPerPage = 10;

  const fetchBookings = useCallback(
    async (page = 1) => {
      if (!id) return;
      
      try {
        setLoadingBookings(true);
        const resp = await AdminSitterService.getBookings({
          sitterId: Array.isArray(id) ? id[0] : id,
          page,
          limit: bookingsPerPage,
        });
        setBookings(resp?.data ?? []);
        setBookingTotalPages(resp?.pagination?.totalPages ?? 1);
        setBookingTotalRecords(resp?.pagination?.totalRecords ?? 0);
        setBookingCurrentPage(page);
      } catch (e) {
        console.error("Error fetching bookings:", e);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    },
    [id]
  );

  const openBookingDetail = useCallback(async (row: BookingRow, sitterName?: string) => {
    try {
      setIsBookingDetailLoading(true);
      const resp = await AdminSitterService.getBookings({
        sitterId: Array.isArray(id) ? id[0] : id!,
        id: row.id,
      });
      const d = resp as bookingData;
      
      // Map booking_status number to BookingStatus string
      const getBookingStatus = (statusId: number): BookingStatus => {
        switch (statusId) {
          case 1: return "waiting";
          case 2: return "waiting_for_service";
          case 3: return "in_service";
          case 4: return "success";
          case 5: return "canceled";
          default: return "waiting";
        }
      };
      
      const booking: BookingCardProps & {
        totalTHB?: number;
        transactionNo?: string;
      } = {
        id: d.id,
        status: getBookingStatus(d.booking_status),
        title: "Boarding",
        sitterName: sitterName || "Pet Sitter",
        transactionDate: d.transaction_date
          ? new Date(d.transaction_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
        dateTime: d.date_start,
        duration: `${d.date_start} - ${d.date_end}`,
        pet: "Pet(s)",
        transactionNo: d.transaction_id || "",
        totalTHB: d.amount,
      };
      
      setSelectedBooking(booking);
      setBookingDialogOpen(true);
    } catch (e) {
      console.error("Error fetching booking detail:", e);
    } finally {
      setIsBookingDetailLoading(false);
    }
  }, [id]);

  return {
    bookings,
    loadingBookings,
    bookingCurrentPage,
    bookingTotalPages,
    bookingTotalRecords,
    bookingDialogOpen,
    isBookingDetailLoading,
    selectedBooking,
    bookingsPerPage,
    fetchBookings,
    openBookingDetail,
    setBookingDialogOpen,
  };
}
