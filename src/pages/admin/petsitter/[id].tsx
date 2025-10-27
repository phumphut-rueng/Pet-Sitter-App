import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { Toaster } from "react-hot-toast";
import { useSitterDetail } from "@/hooks/admin/useSitterDetail";
import { useSitterBookings } from "@/hooks/admin/useSitterBookings";
import { useSitterReviews } from "@/hooks/admin/useSitterReviews";
import { useSitterHistory } from "@/hooks/admin/useSitterHistory";
import { useSitterActions } from "@/hooks/admin/useSitterActions";
import { useTabNavigation } from "@/hooks/admin/useTabNavigation";
import { getStatusKey } from "@/lib/utils/adminUtils";
import { SitterHeader } from "@/components/admin/sitters/SitterHeader";
import { RejectedBanner } from "@/components/admin/sitters/RejectedBanner";
import { TabNavigation } from "@/components/admin/sitters/TabNavigation";
import { TabContent } from "@/components/admin/sitters/TabContent";
import { LoadingOverlay } from "@/components/admin/sitters/LoadingOverlay";
import { RejectModal } from "@/components/admin/sitters/RejectModal";

export default function PetSitterDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // Custom hooks for data management
  const { sitter, loading, fetchSitterDetail } = useSitterDetail(id);
  const {
    bookings,
    loadingBookings,
    bookingCurrentPage,
    bookingTotalPages,
    bookingTotalRecords,
    bookingDialogOpen,
    isBookingDetailLoading,
    selectedBooking,
    fetchBookings,
    openBookingDetail,
    setBookingDialogOpen,
  } = useSitterBookings(id);
  const {
    reviews,
    loadingReviews,
    reviewCurrentPage,
    reviewTotalPages,
    reviewTotalRecords,
    fetchReviews,
    handleDeleteReview,
  } = useSitterReviews(id);
  const {
    history: historyData,
    loadingHistory,
    historyCurrentPage,
    historyTotalPages,
    historyTotalRecords: totalHistoryCount,
    fetchHistory,
  } = useSitterHistory(id);
  const {
    showRejectModal,
    setShowRejectModal,
    rejectReason,
    setRejectReason,
    handleApproveSitter,
    handleRejectSitter,
  } = useSitterActions();
  const { activeTab, handleTabChange } = useTabNavigation("profile");

  // Constants
  const itemsPerPage = 8;
  const bookingsPerPage = 10;
  const reviewsPerPage = 5;

  // Fetch initial data
  useEffect(() => {
    if (id) {
      fetchSitterDetail();
    }
  }, [id, fetchSitterDetail]);

  // Fetch data based on active tab
  useEffect(() => {
    if (!id) return;

    switch (activeTab) {
      case "booking":
        fetchBookings(1);
        break;
      case "reviews":
        fetchReviews(1);
        break;
      case "history":
        fetchHistory(1);
        break;
    }
  }, [activeTab, id, fetchBookings, fetchReviews, fetchHistory]);

  // Event handlers
  const handleApproveClick = () => {
    if (sitter) {
      handleApproveSitter(sitter.id);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (sitter) {
      handleRejectSitter(sitter.id);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Admin • Pet Sitter Detail</title>
        </Head>
        <div className="flex min-h-screen w-full">
          <aside className="hidden shrink-0 md:block md:w-[240px]">
            <AdminSidebar sticky />
          </aside>
          <main className="flex flex-1 items-center justify-center">
            <PetPawLoading message="Loading Pet Sitter Details" size="md" />
          </main>
        </div>
      </>
    );
  }

  if (!sitter) {
    return (
      <>
        <Head>
          <title>Admin • Pet Sitter Detail</title>
        </Head>
        <div className="flex min-h-screen w-full">
          <aside className="hidden shrink-0 md:block md:w-[240px]">
            <AdminSidebar sticky />
          </aside>
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-ink mb-4">
                Pet Sitter Not Found
              </h1>
              <Link
                href="/admin/petsitter"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-brand-text rounded-lg hover:bg-brand-dark transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Pet Sitters
              </Link>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin • Pet Sitter Detail</title>
      </Head>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        }}
      />

      <div className="flex min-h-screen w-full">
        <aside className="hidden shrink-0 md:block md:w-[240px]">
          <AdminSidebar sticky />
        </aside>

        <main className="relative flex-1 px-4 py-6 lg:px-6">
          <div className="mx-auto max-w-[1200px]">
            {/* Header Section */}
            {sitter && (
              <SitterHeader
                sitter={sitter}
                onRejectClick={handleRejectClick}
                onApproveClick={handleApproveClick}
              />
            )}

            {/* Rejected Status Banner */}
            {sitter && <RejectedBanner sitter={sitter} />}

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Main Content */}
            <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-8">
              {sitter && (
                <TabContent
                  activeTab={activeTab}
                  sitter={sitter}
                  bookings={bookings}
                  loadingBookings={loadingBookings}
                  bookingDialogOpen={bookingDialogOpen}
                  onBookingDialogChange={setBookingDialogOpen}
                  selectedBooking={selectedBooking}
                  openBookingDetail={(row) => openBookingDetail(row, sitter?.name || sitter?.user_name || "Pet Sitter")}
                  totalPages={bookingTotalPages}
                  currentPage={bookingCurrentPage}
                  onPageChange={fetchBookings}
                  totalRecords={bookingTotalRecords}
                  itemsPerPage={bookingsPerPage}
                  reviews={reviews}
                  loading={loadingReviews}
                  reviewTotalPages={reviewTotalPages}
                  reviewCurrentPage={reviewCurrentPage}
                  onReviewPageChange={fetchReviews}
                  reviewTotalRecords={reviewTotalRecords}
                  reviewsPerPage={reviewsPerPage}
                  onDelete={handleDeleteReview}
                  historyData={historyData}
                  loadingHistory={loadingHistory}
                  historyTotalPages={historyTotalPages}
                  historyCurrentPage={historyCurrentPage}
                  onHistoryPageChange={fetchHistory}
                  totalHistoryCount={totalHistoryCount}
                  historyItemsPerPage={itemsPerPage}
                  getStatusKey={getStatusKey}
                />
              )}
            </div>

            {/* Reject Confirmation Modal */}
            <RejectModal
              isOpen={showRejectModal}
              onClose={() => setShowRejectModal(false)}
              rejectReason={rejectReason}
              onRejectReasonChange={setRejectReason}
              onConfirm={handleRejectConfirm}
            />
          </div>
        </main>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isBookingDetailLoading} />
    </>
  );
}
