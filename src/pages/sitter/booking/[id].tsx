import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SitterSidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import { StatusBadge, StatusKey } from "@/components/badges/StatusBadge";
import { Button } from "@/components/ui/button";
import axios from "axios";
import PetOwnerDetailModal from "@/components/modal/PetOwnerDetail";
import PetCard from "@/components/cards/PetCard";
import PetDetailModal from "@/components/modal/PetDetail";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import BookingRejectConfirmation from "@/components/modal/BookingRejectConfirmation";
import toast, { Toaster } from "react-hot-toast";

type BookingDetail = {
  id: number;
  ownerName: string;
  pets: number;
  duration: string;
  bookingDate: string;
  totalPaid: string;
  paymentMethod: string;
  transactionDate: string;
  transactionId: string;
  message: string;
  status: StatusKey;
  petsDetail: Pet[];
  ownerEmail: string;
  ownerPhone: string;
  ownerIdNumber: string;
  ownerDOB: string;
  avatarUrl: string;
};

type Pet = {
  id: number;
  name: string;
  species: string;
  img: string;
  breed?: string;
  sex?: string;
  age?: string;
  color?: string;
  about?: string;
  weight?: string;
};

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
  const router = useRouter();
  const params = useParams();

  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/icons/avatar-placeholder.svg");
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpenAlert, setisOpenAlert] = useState(false);

  //pet owner modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const handleOpenProfile = () => setShowProfileModal(true);
  const handleCloseProfile = () => setShowProfileModal(false);

  //pet modal
  const [showPetModal, setShowPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const handleOpenPetDetail = (pet: Pet) => {
    setSelectedPet(pet);
    setShowPetModal(true);
  };

  const handleClosePetDetail = () => {
    setSelectedPet(null);
    setShowPetModal(false);
  };

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

  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `/api/sitter/get-booking?id=${params.id}`
        );
        setBooking(data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          router.replace("/404");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <PetPawLoading
          message="Loading Pet"
          size="lg"
          baseStyleCustum="flex items-center justify-center w-full h-full"
        />
      </div>
    );
  }

  if (!booking) return null;

  // ปุ่ม เปลี่ยนตาม status
  const renderActionButtons = () => {
    switch (booking.status) {
      case "waitingConfirm":
        return (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 w-42 border-orange-1 text-orange-5 bg-orange-1 rounded-full font-bold hover:bg-orange-2 hover:border-orange-2"
              onClick={() => setisOpenAlert(true)}
            >
              Reject Booking
            </Button>
            <Button className="h-12 w-42 bg-orange-5 text-white rounded-full font-bold hover:bg-orange-4"
              onClick={() => updateBookingStatus(4)} // waiting for service
              >
              Confirm Booking
            </Button>
          </div>
        );
      case "waitingService":
        return (
          <Button className="h-12 w-32 bg-orange-5 text-white font-bold rounded-full px-5"
            onClick={() => updateBookingStatus(6)} // in service
            >
              In service
          </Button>
        );
      case "inService":
        return (
          <Button className="h-12 w-30 bg-orange-5 text-white font-bold rounded-full px-5"
            onClick={() => updateBookingStatus(7)} // success
            >
              Success
          </Button>
        );
      default:
        return null;
    }
  };

  const updateBookingStatus = async (statusId: number) => {
    try {
      await axios.put("/api/sitter/update-booking-status", {
        bookingId: booking?.id,
        statusId,
      });
      // โหลดข้อมูลใหม่หลังอัปเดต
      const { data } = await axios.get(
        `/api/sitter/get-booking?id=${params.id}`
      );
      toast.success("Booking status updated successfully!");
      setBooking(data);
    } catch (error) {
      toast.error("Failed to update booking status");
    }
  };

  return (
    <main className="flex container-1200 !px-0 bg-gray-1">
      <Toaster position="top-right"/>
      <SitterSidebar className="min-w-0" />
      <section className="flex-1 min-w-0">
        <PetSitterNavbar avatarUrl={avatarUrl} name={userName} />

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
            <StatusBadge status={booking.status} className="text-base mt-1" />
          </div>
          {renderActionButtons()}
        </div>

        <div className="px-8 pb-10">
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
              <div className="grid grid-cols-4 gap-2 mt-2">
                {booking.petsDetail.map((pet) => (
                  <PetCard
                    key={pet.id}
                    name={pet.name}
                    species={pet.species}
                    img={pet.img}
                    selected={false}
                    disabled={false}
                    className="!w-45 !h-60 gap-2 cursor-pointer"
                    onClick={() => handleOpenPetDetail(pet)}
                  />
                ))}
              </div>
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
              <p className="mt-1 font-medium">{booking.totalPaid} THB</p>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-xl">Payment Method</h4>
              <p className="mt-1 font-medium">{booking.paymentMethod}</p>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-xl">
                Transaction Date
              </h4>
              <p className="mt-1 font-medium">{booking.transactionDate}</p>
            </div>

            <div>
              <h4 className="text-gray-4 font-bold text-lg">Transaction No.</h4>
              <p className="mt-1 font-medium">{booking.transactionId}</p>
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

      {/* Pet Owner Modal */}
      <PetOwnerDetailModal
        isOpen={showProfileModal}
        onClose={handleCloseProfile}
        ownerName={booking.ownerName}
        email={booking.ownerEmail}
        phone={booking.ownerPhone}
        idNumber={booking.ownerIdNumber}
        dateOfBirth={booking.ownerDOB}
        avatarUrl={booking.avatarUrl}
      />

      {/* Pet Detail Modal */}
      {selectedPet && (
        <PetDetailModal
          isOpen={showPetModal}
          onClose={handleClosePetDetail}
          petName={selectedPet.name}
          petType={selectedPet.species}
          sex={selectedPet.sex}
          breed={selectedPet.breed}
          age={selectedPet.age}
          about={selectedPet.about}
          color={selectedPet.color}
          weight={selectedPet.weight}
          avatarUrl={selectedPet.img}
        />
      )}

      <BookingRejectConfirmation
        open={isOpenAlert}
        onOpenChange={setisOpenAlert}
        onConfirm={() => {
          updateBookingStatus(8); // canceled
          setisOpenAlert(false);
        }}
      />
    </main>
  );
}
