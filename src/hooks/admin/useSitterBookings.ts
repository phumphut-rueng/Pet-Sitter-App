import { useState, useCallback } from "react";
import { AdminSitterService } from "@/lib/services/adminSitterService";
import type { BookingRow } from "@/types/admin";
import type { BookingCardProps, BookingStatus } from "@/components/cards/BookingCard";

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
      const d = resp; // API returns the detail object directly, not wrapped in bookingData
      
      // Map status string to BookingStatus string
      const getBookingStatus = (status: string): BookingStatus => {
        switch (status) {
          case "waiting": return "waiting";
          case "waiting_for_service": return "waiting_for_service";
          case "in_service": return "in_service";
          case "success": return "success";
          case "canceled": return "canceled";
          default: return "waiting";
        }
      };
      
      const booking: BookingCardProps & {
        totalTHB?: number;
        transactionNo?: string;
        ownerName?: string;
        pets?: number;
        petsDetail?: Array<{
          id: number;
          name: string;
          img?: string | null;
          species?: string;
        }>;
      } = {
        id: d.id,
        status: getBookingStatus(d.status),
        title: "Boarding",
        sitterName: sitterName || "Pet Sitter",
        transactionDate: d.transactionDate
          ? new Date(d.transactionDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
        dateTime: d.bookingDate,
        duration: d.duration,
        pet: `${d.pets} Pet(s)`,
        transactionNo: d.transactionNo || "",
        totalTHB: d.totalPaid,
        // Add the missing properties that the modal expects
        ownerName: d.ownerName,
        pets: d.pets,
        petsDetail: d.petsDetail || [],
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
