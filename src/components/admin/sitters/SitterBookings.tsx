import { PetPawLoadingSmall } from "@/components/loading/PetPawLoadingSmall";
import { Pagination } from "@/components/pagination/Pagination";
import { PaginationInfo } from "@/components/pagination/PaginationInfo";
import { StatusBadge } from "@/components/badges/StatusBadge";
import BookingDetailDialogAdmin from "@/components/modal/BookingDetailAdmin";
import type { BookingCardProps } from "@/components/cards/BookingCard";

type BookingRowStatus =
  | "waitingConfirm"
  | "waitingService"
  | "inService"
  | "success"
  | "canceled";

interface BookingRow {
  id: number;
  ownerName: string;
  petCount: number;
  duration: string;
  bookedDate: string;
  status: BookingRowStatus;
}

interface SitterBookingsProps {
  bookings: BookingRow[];
  loadingBookings: boolean;
  bookingDialogOpen: boolean;
  onBookingDialogChange: (open: boolean) => void;
  selectedBooking: (BookingCardProps & { totalTHB?: number; transactionNo?: string }) | null;
  openBookingDetail: (row: BookingRow) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  itemsPerPage: number;
}

export default function SitterBookings({
  bookings,
  loadingBookings,
  bookingDialogOpen,
  onBookingDialogChange,
  selectedBooking,
  openBookingDetail,
  totalPages,
  currentPage,
  onPageChange,
  totalRecords,
  itemsPerPage,
}: SitterBookingsProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg">
        {loadingBookings ? (
          <div className="flex justify-center py-10">
            <PetPawLoadingSmall message="Loading Bookings" />
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-ink/90 text-white">
                <th className="px-5 py-3 text-xs2-medium text-left">
                  Pet Owner
                </th>
                <th className="px-5 py-3 text-xs2-medium text-left">Pet(s)</th>
                <th className="px-5 py-3 text-xs2-medium text-left">
                  Duration
                </th>
                <th className="px-5 py-3 text-xs2-medium text-left">
                  Booked Date
                </th>
                <th className="px-5 py-3 text-xs2-medium text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-xs2-medium text-muted-text"
                  >
                    No bookings
                  </td>
                </tr>
              ) : (
                bookings.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-border last:border-b hover:bg-muted/20 cursor-pointer"
                    onClick={() => openBookingDetail(row)}
                  >
                    <td className="px-5 py-4 text-sm2-medium text-left text-ink">
                      {row.ownerName}
                    </td>
                    <td className="px-5 py-4 text-sm2-medium text-left text-ink">
                      {row.petCount}
                    </td>
                    <td className="px-5 py-4 text-sm2-medium text-left text-ink">
                      {row.duration}
                    </td>
                    <td className="px-5 py-4 text-sm2-medium text-left text-ink">
                      {row.bookedDate}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination for bookings */}
      {totalPages > 1 && !loadingBookings && (
        <div className="flex items-center justify-between px-2 py-4">
          <PaginationInfo
            currentCount={bookings.length}
            totalCount={totalRecords}
            currentPage={currentPage}
            totalPages={totalPages}
            limit={itemsPerPage}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onClick={onPageChange}
          />
        </div>
      )}

      {/* Booking Detail Modal */}
      <BookingDetailDialogAdmin
        open={bookingDialogOpen}
        onOpenChange={onBookingDialogChange}
        booking={selectedBooking}
      />
    </div>
  );
}
