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
      const d = resp as any;
      const booking: BookingCardProps & {
        totalTHB?: number;
        transactionNo?: string;
      } = {
        id: d.id,
        status: d.status as BookingStatus,
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
        transactionNo: d.transactionNo,
        totalTHB:
          typeof d.totalPaid === "number" ? d.totalPaid : Number(d.totalPaid ?? 0),
      };
      
      // Attach additional data
      (booking as any).ownerName = d.ownerName;
      (booking as any).pets = d.pets;
      (booking as any).petsDetail = d.petsDetail || [];
      
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
