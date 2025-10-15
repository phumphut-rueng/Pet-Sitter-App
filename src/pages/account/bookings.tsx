"use client";
import React, { useState } from "react";
import AccountPageShell from "@/components/layout/AccountPageShell";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import BookingCard, { type BookingCardProps } from "@/components/cards/BookingCard";
import ReportDialog from "@/components/modal/BookingReport";
import RatingReviewDialog from "@/components/modal/RatingReview";
import ReviewSummaryDialog from "@/components/modal/ReviewSummary";
import BookingDetailDialog from "@/components/modal/BookingDetail";
import BookingChange from "@/components/modal/BookingChange";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { useBookingHistory } from "@/hooks/booking/useBookingHistory";
import { useBookingActions } from "@/hooks/booking/useBookingActions";

export default function BookingHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userId = session?.user?.id ? Number(session.user.id) : null;
  const { bookings, loading, error, setBookings } = useBookingHistory(userId);

  const [openReport, setOpenReport] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openChangeDialog, setOpenChangeDialog] = useState(false);

  const [reviewData, setReviewData] = useState<{
    rating: number;
    review: string;
    date: string;
  } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingCardProps | null>(null);

  // redirect if not logged in
  if (status !== "loading" && !session?.user) {
    router.push("/auth/login");
  }

  const { handleReportSubmit, handleReviewSubmit, handleChangeDate } =
    useBookingActions({
      userId: userId || 0,
      selectedBooking,
      setBookings,
      setOpenReport,
      setOpenReview,
      setReviewData,
      setOpenSummary,
      setOpenChangeDialog,
      setSelectedBooking,
    });

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <AccountPageShell title="Booking History">
        <PetPawLoading
        message="Loading booking history"
        size="lg"
      />
      </AccountPageShell>
    );
  }

  if (error) {
    return (
      <AccountPageShell title="Booking History">
        <div className="flex justify-center items-center min-h-screen text-red-500 text-lg">
          {error}
        </div>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell title="Booking History">
      <div className="flex min-h-screen">
        <main className="flex-1 py-4 px-2 max-w-[343px] bg-white rounded-xl md:p-8 md:max-w-none">
          <h1 className="text-2xl font-bold mb-6">Booking History</h1>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">No bookings found.</p>
          ) : (
            <div className="space-y-6">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("button")) return;
                    setOpenDetail(true);
                    setSelectedBooking(b);
                  }}
                  className="cursor-pointer"
                >
                  <BookingCard
                    key={b.id}
                    {...b}
                    onReport={() => {
                      setOpenReport(true);
                      setSelectedBooking(b);
                    }}
                    onReview={() => {
                      setOpenReview(true);
                      setSelectedBooking(b);
                    }}
                    onChange={() => {
                      setSelectedBooking(b);
                      setOpenChangeDialog(true);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <BookingDetailDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        booking={selectedBooking}
        onChangeDateTime={() => {
          setOpenDetail(false);
          setOpenChangeDialog(true);
        }}
      />

      <BookingChange
        bookingId={selectedBooking?.id ?? 0}
        currentStart={selectedBooking?.dateStart}
        currentEnd={selectedBooking?.dateEnd}
        open={openChangeDialog}
        onOpenChange={setOpenChangeDialog}
        onSubmitChangeDate={handleChangeDate}
        disabledDates={[]}
      />

      <ReportDialog
        open={openReport}
        onOpenChange={setOpenReport}
        onSubmit={handleReportSubmit}
      />

      <RatingReviewDialog
        open={openReview}
        onOpenChange={setOpenReview}
        onSubmit={handleReviewSubmit}
      />

      <ReviewSummaryDialog
        open={openSummary}
        onOpenChange={setOpenSummary}
        user={{
          name: session?.user?.name || "",
          avatarUrl: session?.user?.image || "/Icons/bubba.svg",
        }}
        data={reviewData}
      />
    </AccountPageShell>
  );
}
