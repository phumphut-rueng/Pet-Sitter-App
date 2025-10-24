import SitterProfile from "@/components/admin/sitters/SitterProfile";
import SitterBookings from "@/components/admin/sitters/SitterBookings";
import SitterReviews from "@/components/admin/sitters/SitterReviews";
import SitterHistory from "@/components/admin/sitters/SitterHistory";
import type { TabType, SitterDetail } from "@/types/admin";
import type { BookingCardProps, BookingStatus } from "@/components/cards/BookingCard";

interface TabContentProps {
  activeTab: TabType;
  sitter: SitterDetail;
  // Bookings props
  bookings: any[];
  loadingBookings: boolean;
  bookingDialogOpen: boolean;
  onBookingDialogChange: (open: boolean) => void;
  selectedBooking: (BookingCardProps & { totalTHB?: number; transactionNo?: string }) | null;
  openBookingDetail: (row: any) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  itemsPerPage: number;
  // Reviews props
  reviews: any[];
  loading: boolean;
  reviewTotalPages: number;
  reviewCurrentPage: number;
  onReviewPageChange: (page: number) => void;
  reviewTotalRecords: number;
  reviewsPerPage: number;
  onDelete: (reviewId: number) => void;
  // History props
  historyData: any[];
  loadingHistory: boolean;
  historyTotalPages: number;
  historyCurrentPage: number;
  onHistoryPageChange: (page: number) => void;
  totalHistoryCount: number;
  historyItemsPerPage: number;
  getStatusKey: (status: string) => any;
}

export function TabContent({
  activeTab,
  sitter,
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
  reviews,
  loading,
  reviewTotalPages,
  reviewCurrentPage,
  onReviewPageChange,
  reviewTotalRecords,
  reviewsPerPage,
  onDelete,
  historyData,
  loadingHistory,
  historyTotalPages,
  historyCurrentPage,
  onHistoryPageChange,
  totalHistoryCount,
  historyItemsPerPage,
  getStatusKey,
}: TabContentProps) {
  switch (activeTab) {
    case "profile":
      return <SitterProfile sitter={sitter} />;
    
    case "booking":
      return (
        <SitterBookings
          bookings={bookings}
          loadingBookings={loadingBookings}
          bookingDialogOpen={bookingDialogOpen}
          onBookingDialogChange={onBookingDialogChange}
          selectedBooking={selectedBooking}
          openBookingDetail={openBookingDetail}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
          totalRecords={totalRecords}
          itemsPerPage={itemsPerPage}
        />
      );
    
    case "reviews":
      return (
        <SitterReviews
          reviews={reviews}
          loading={loading}
          totalPages={reviewTotalPages}
          currentPage={reviewCurrentPage}
          onPageChange={onReviewPageChange}
          totalRecords={reviewTotalRecords}
          itemsPerPage={reviewsPerPage}
          onDelete={onDelete}
        />
      );
    
    case "history":
      return (
        <SitterHistory
          historyData={historyData}
          loadingHistory={loadingHistory}
          totalPages={historyTotalPages}
          currentPage={historyCurrentPage}
          onPageChange={onHistoryPageChange}
          totalRecords={totalHistoryCount}
          itemsPerPage={historyItemsPerPage}
          getStatusKey={getStatusKey}
        />
      );
    
    default:
      return null;
  }
}
