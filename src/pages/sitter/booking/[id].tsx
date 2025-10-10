import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SitterSidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import { StatusBadge, StatusKey } from "@/components/badges/StatusBadge";
import { Button } from "@/components/ui/button";
import axios from "axios";
import PetOwnerDetailModal from "@/components/modal/PetOwnerDetail";

type BookingDetail = {
  id: number;
  ownerName: string;
  pets: number;
  duration: string;
  bookingDate: string;
  totalPaid: string;
  transactionDate: string;
  transactionNo: string;
  message: string;
  status: StatusKey;
};

// Mock ข้อมูล
const mockBookingDetails: BookingDetail[] = [
  {
    id: 1,
    ownerName: "John Wick",
    pets: 2,
    duration: "3 hours",
    bookingDate: "25 Aug 2024 | 7 AM - 10 AM",
    totalPaid: "900.00 THB",
    transactionDate: "25 Aug 2024",
    transactionNo: "122312",
    message: "I love my dogs, care",
    status: "waitingConfirm",
  },
  {
    id: 2,
    ownerName: "Robert Jr.",
    pets: 1,
    duration: "24 hours",
    bookingDate: "12 Aug 2024 | 7 AM - 11 AM",
    totalPaid: "300.00 THB",
    transactionDate: "12 Aug 2024",
    transactionNo: "122332",
    message: "I love my cats, care",
    status: "waitingConfirm",
  },
  {
    id: 3,
    ownerName: "Maren Press",
    pets: 6,
    duration: "2 hours",
    bookingDate: "2 Aug 2023 | 7 AM - 9 AM",
    totalPaid: "1200.00 THB",
    transactionDate: "16 Oct 2022",
    transactionNo: "122319",
    message: "I love my dogs, care",
    status: "waitingService",
  },
  {
    id: 4,
    ownerName: "Lincoln Vaccaro",
    pets: 4,
    duration: "3 hours",
    bookingDate: "25 Aug 2024 | 7 AM - 10 AM",
    totalPaid: "900.00 THB",
    transactionDate: "25 Aug 2024",
    transactionNo: "122352",
    message: "I love my dogs, care",
    status: "inService",
  },
  {
    id: 5,
    ownerName: "Andaman R",
    pets: 2,
    duration: "3 hours",
    bookingDate: "25 Aug 2024 | 7 AM - 9 AM",
    totalPaid: "900.00 THB",
    transactionDate: "25 Aug 2024",
    transactionNo: "122305",
    message: "I love my dogs, care",
    status: "success",
  },
  {
    id: 6,
    ownerName: "Chatchai Haithong",
    pets: 2,
    duration: "3 hours",
    bookingDate: "29 July 2024 | 7 AM - 11 AM",
    totalPaid: "900.00 THB",
    transactionDate: "29 July 2024",
    transactionNo: "122325",
    message: "I love my dogs, care",
    status: "canceled",
  },
];

type GetSitterResponse = {
  user: {
    id: number;
    name: string;
    profile_image: string | null;
  };
  sitter: null | {
    id: number;
    name: string | null;
  };
};

export default function BookingDetailPage() {
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/icons/avatar-placeholder.svg");

  const router = useRouter();
  const params = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const handleOpenProfile = () => setShowProfileModal(true);
  const handleCloseProfile = () => setShowProfileModal(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<GetSitterResponse>(
          "/api/sitter/get-profile-sitter"
        );
        setUserName(data.user.name || data.sitter?.name || "");
        setAvatarUrl(
          data.user.profile_image || "/icons/avatar-placeholder.svg"
        );
      } catch (error) {
        console.error("Failed to load sitter data:", error);
      }
    })();
  }, []);

  // โหลด mock ข้อมูล จาก params.id
  useEffect(() => {
    if (!params?.id) return;
    const id = Number(params.id);
    const found = mockBookingDetails.find((b) => b.id === id);
    setBooking(found || null);
  }, [params?.id]);

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Booking not found</p>
      </div>
    );
  }

  // ปุ่ม เปลี่ยนตาม status
  const renderActionButtons = () => {
    switch (booking.status) {
      case "waitingConfirm":
        return (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 w-42 border-orange-1 text-orange-5 bg-orange-1 rounded-full font-bold hover:bg-orange-2 hover:border-orange-2"
            >
              Reject Booking
            </Button>
            <Button className="h-12 w-42 bg-orange-5 text-white rounded-full font-bold hover:bg-orange-4">
              Confirm Booking
            </Button>
          </div>
        );
      case "waitingService":
        return (
          <Button className="h-12 w-32 bg-orange-5 text-white font-bold rounded-full px-5">
            In Service
          </Button>
        );
      case "inService":
        return (
          <Button className="h-12 w-30 bg-orange-5 text-white font-bold rounded-full px-5">
            Success
          </Button>
        );
      default:
        return null;
    }
  };
  return (
    <main className="flex container-1200 !px-0 bg-gray-1">
      <SitterSidebar className="min-w-0" />
      <section className="flex-1 min-w-0">
        {/* Navbar */}
        <PetSitterNavbar avatarUrl={avatarUrl} name={userName} />

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-6 text-2xl hover:text-gray-9"
            >
              ←
            </button>
            <h2 className="text-2xl font-semibold text-black">
              {booking.ownerName}
            </h2>
            <StatusBadge status={booking.status} className="text-base" />
          </div>

          {/* ปุ่มด้านขวา */}
          {renderActionButtons()}
        </div>

        {/* Booking detail */}
        <div className="px-8">
          <div className="bg-white rounded-2xl px-18 py-8 space-y-6">
            <h4 className="text-gray-4 font-bold text-xl mb-1">
              Pet Owner Name
            </h4>
            <div className="flex items-center justify-between">
              <p className="font-medium">{booking.ownerName}</p>
              <button
                onClick={handleOpenProfile}
                className="inline-flex items-center gap-1 text-orange-5 font-bold hover:text-orange-4 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Profile
              </button>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-xl">Pet(s)</h4>
              <p className="mt-1 font-medium">{booking.pets}</p>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-xl">Pet Detail</h4>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-xl">Duration</h4>
              <p className="mt-1 font-medium">{booking.duration}</p>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-xl">Booking Date</h4>
              <p className="mt-1 font-medium">{booking.bookingDate}</p>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-xl">Total Paid</h4>
              <p className="mt-1 font-medium">{booking.totalPaid}</p>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-xl">
                Transaction Date
              </h4>
              <p className="mt-1 font-medium">{booking.transactionDate}</p>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-lg">Transaction No.</h4>
              <p className="mt-1 font-medium">{booking.transactionNo}</p>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-lg">
                Additional Message
              </h4>
              <p className="mt-1 font-medium">{booking.message}</p>
            </div>
          </div>
        </div>
      </section>

      {/* pet owner detail Popup */}
      <PetOwnerDetailModal
        isOpen={showProfileModal}
        onClose={handleCloseProfile}
        ownerName={booking.ownerName}
      />
    </main>
  );
}
