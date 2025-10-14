import React, { useEffect } from "react";
import AccountPageShell from "@/components/layout/AccountPageShell";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import BookingCard, {
  type BookingCardProps,
} from "@/components/cards/ATestBookingCard";
import ReportDialog from "@/components/modal/BookingReport";
import RatingReviewDialog from "@/components/modal/RatingReview";
import ReviewSummaryDialog from "@/components/modal/ReviewSummary";
import BookingDetailDialog from "@/components/modal/BookingDetail";
import BookingChange from "@/components/modal/BookingChange";

export default function BookingHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [openReport, setOpenReport] = React.useState(false);
  const [openReview, setOpenReview] = React.useState(false);
  const [openSummary, setOpenSummary] = React.useState(false);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openChangeDialog, setOpenChangeDialog] = React.useState(false);

  const [reviewData, setReviewData] = React.useState<{
    rating: number;
    review: string;
    date: string;
  } | null>(null);
  const [selectedBooking, setSelectedBooking] =
    React.useState<BookingCardProps | null>(null);

  useEffect(() => {
    if (status === "loading") return; // รอโหลด session ก่อน
    if (!session?.user) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // mock data จำลองจาก DB
  const bookings: BookingCardProps[] = [
    {
      id: 1,
      status: "waiting",
      title: "Happy House!",
      sitterName: "Jane Maison",
      avatarUrl: "/images/avatar1.png",
      transactionDate: "Tue, 10 Aug 2023",
      dateTime: "25 Aug, 2023 | 7 AM - 10 AM",
      duration: "3 hours",
      pet: "Bubba, Daisy",
    },
    {
      id: 2,
      status: "in_service",
      title: "Gentle >< for all pet! (Kid friendly)",
      sitterName: "Jane Maison",
      avatarUrl: "/images/avatar2.png",
      transactionDate: "Tue, 14 Aug 2023",
      dateTime: "25 Aug, 2023 | 7 AM - 10 AM",
      duration: "3 hours",
      pet: "Mr.Ham, Bingsu",
    },
    {
      id: 3,
      status: "success",
      title: "We love cat and your cat",
      sitterName: "Jane Maison",
      avatarUrl: "/images/cat.png",
      transactionDate: "Tue, 24 Apr 2023",
      dateTime: "25 Aug, 2023 | 7 AM - 10 AM",
      duration: "3 hours",
      pet: "Mr.Ham, Bingsu",
      successDate: "Tue, 26 Apr 2023 | 11:03 AM",
    },
    {
      id: 4,
      status: "canceled",
      title: "Energetic pup needs walk",
      sitterName: "Jane Maison",
      avatarUrl: "/images/cat.png",
      transactionDate: "Tue, 24 Apr 2023",
      dateTime: "25 Aug, 2023 | 7 AM - 10 AM",
      duration: "3 hours",
      pet: "Mr.Ham, Bingsu",
      canceledReason: "Pet sitter is unavailable on this date",
    },
  ];

  const handleReportSubmit = (data: { issue: string; description: string }) => {
    if (!selectedBooking) return;

    console.log("Report submitted:", {
      bookingId: selectedBooking.id,
      title: selectedBooking.title,
      sitter: selectedBooking.sitterName,
      ...data,
    });
    setOpenReport(false);
  };

  const handleReviewSubmit = (data: { rating: number; review: string }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    setReviewData({
      rating: data.rating,
      review: data.review,
      date: formattedDate,
    });

    if (!selectedBooking) return;
    console.log("Review submitted:", {
      bookingId: selectedBooking.id,
      sitter: selectedBooking.sitterName,
      title: selectedBooking.title,
      ...data,
    });
    setOpenReview(false);
    setOpenSummary(true);
  };

  const handleChangeDateTime = (booking: BookingCardProps) => {
    setSelectedBooking(booking);
    setOpenChangeDialog(true);
  };

  return (
    <AccountPageShell title="Booking History">
      <div className="flex min-h-screen">
        <main className="flex-1 py-4 px-2 max-w-[343px] bg-white rounded-xl md:p-8 md:max-w-none">
          <h1 className="text-2xl font-bold mb-6">Booking History</h1>
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
                  onChange={() => handleChangeDateTime(b)}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
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
        sitterId={selectedBooking?.id ?? 0}
        open={openChangeDialog}
        onOpenChange={setOpenChangeDialog}
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
          name: session?.user?.name || "John Wick",
          avatarUrl: session?.user?.image || "/Icons/bubba.svg",
        }}
        data={reviewData}
      />
    </AccountPageShell>
  );
}
