import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";
import { StatusBadge, StatusKey } from "@/components/badges/StatusBadge";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import type { BookingCardProps, BookingStatus } from "@/components/cards/BookingCard";
import SitterProfile from "@/components/admin/sitters/SitterProfile";
import SitterBookings from "@/components/admin/sitters/SitterBookings";
import SitterReviews from "@/components/admin/sitters/SitterReviews";
import SitterHistory from "@/components/admin/sitters/SitterHistory";

interface SitterDetail {
  id: number;
  name: string;
  user_name: string;
  user_email: string;
  user_dob: string;
  user_profile_image: string;
  approval_status: string;
  approval_status_id: number;
  status_updated_at: string;
  location_description: string;
  created_at: string;
  introduction: string;
  phone: string;
  address_detail: string;
  address_province: string;
  address_district: string;
  address_sub_district: string;
  address_post_code: string;
  base_price: string;
  experience: number;
  service_description: string;
  admin_note: string;
  averageRating: number;
  latitude?: number;
  longitude?: number;
  sitter_image: Array<{
    id: number;
    image_url: string;
  }>;
  sitter_pet_type: Array<{
    pet_type: {
      pet_type_name: string;
    };
  }>;
}

export default function PetSitterDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [sitter, setSitter] = useState<SitterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "profile" | "booking" | "reviews" | "history"
  >("profile");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const itemsPerPage = 8;
  const bookingsPerPage = 10;

  // -------------------- Bookings (API) --------------------
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

  const fetchBookings = useCallback(
    async (page = 1) => {
      if (!id) return;
      try {
        setLoadingBookings(true);
        const resp = await axios.get(`/api/admin/petsitter/bookings`, {
          params: {
            sitterId: Array.isArray(id) ? id[0] : id,
            page,
            limit: bookingsPerPage,
          },
        });
        setBookings(resp.data?.data ?? []);
        setBookingTotalPages(resp.data?.pagination?.totalPages ?? 1);
        setBookingTotalRecords(resp.data?.pagination?.totalRecords ?? 0);
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

  useEffect(() => {
    if (activeTab === "booking") {
      fetchBookings(bookingCurrentPage);
    }
  }, [activeTab, fetchBookings]);

  const openBookingDetail = async (row: BookingRow) => {
    try {
      setIsBookingDetailLoading(true);
      const resp = await axios.get(`/api/admin/petsitter/bookings`, {
        params: { sitterId: Array.isArray(id) ? id[0] : id, id: row.id },
      });
      const d = resp.data as any;
      const booking: BookingCardProps & {
        totalTHB?: number;
        transactionNo?: string;
      } = {
        id: d.id,
        status: d.status as BookingStatus,
        title: "Boarding",
        sitterName: sitter?.name || sitter?.user_name || "Pet Sitter",
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
      // attach owner + pets detail via type extension
      (booking as any).ownerName = d.ownerName;
      (booking as any).pets = d.pets;
      (booking as any).petsDetail = d.petsDetail || [];
      setSelectedBooking(booking);
      setBookingDialogOpen(true);
    } catch (e) {
      console.error("Error fetching booking detail:", e);
      toast.error("Failed to load booking details.");
    } finally {
      setIsBookingDetailLoading(false);
    }
  };

  const fetchSitterDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/admin/petsitter/get-sitter-by-id?id=${id}`
      );
      setSitter(response.data);
    } catch (error) {
      console.error("Error fetching sitter detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchHistory = useCallback(
    async (page = 1) => {
      try {
        setLoadingHistory(true);
        const response = await axios.get(
          `/api/admin/petsitter/history?sitterId=${id}&page=${page}&limit=${itemsPerPage}`
        );
        if (response.status === 200) {
          setHistoryData(response.data.data);
          setTotalHistoryCount(response.data.pagination.totalRecords);
          setHistoryTotalPages(response.data.pagination.totalPages);
          setHistoryCurrentPage(page);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoadingHistory(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (id) {
      fetchSitterDetail();
    }
  }, [id, fetchSitterDetail]);

  useEffect(() => {
    if (activeTab === "history" && id) {
      fetchHistory(historyCurrentPage);
    }
  }, [activeTab, id, fetchHistory]);

  const getStatusKey = (status: string): StatusKey => {
    switch (status) {
      case "Waiting for approve":
        return "waitingApprove";
      case "Approved":
        return "approved";
      case "Rejected":
        return "rejected";
      default:
        return "waitingApprove";
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

  const statusKey = getStatusKey(sitter.approval_status);

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
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href="/admin/petsitter"
                    className="inline-flex items-center gap-2 text-muted-text hover:text-ink group"
                  >
                    <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
                  </Link>
                  <div className="flex gap-6">
                    <h1 className="text-2xl font-bold text-ink">
                      {sitter.user_name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={statusKey} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {sitter.approval_status === "Approved" ? (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-6 py-3 text-brand bg-brand-bg border-0 rounded-full font-medium hover:bg-orange-2 hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
                    >
                      Reject
                    </button>
                  ) : sitter.approval_status === "Waiting for approve" ? (
                    <>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="px-6 py-3 text-brand bg-brand-bg border-0 rounded-full font-medium hover:bg-orange-2 hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await axios.put(
                              "/api/admin/petsitter/approve",
                              {
                                sitterId: sitter.id,
                              }
                            );

                            if (response.status === 200) {
                              toast.success(
                                "Pet Sitter approved successfully",
                                {
                                  duration: 2000,
                                  style: {
                                    background: "#10B981",
                                    color: "#fff",
                                    fontWeight: "500",
                                  },
                                }
                              );

                              // Refresh after 2 seconds
                              setTimeout(() => {
                                window.location.reload();
                              }, 2000);
                            }
                          } catch (error) {
                            console.error("Error approving sitter:", error);
                            toast.error(
                              "Failed to approve pet sitter. Please try again.",
                              {
                                duration: 3000,
                                style: {
                                  background: "#EF4444",
                                  color: "#fff",
                                  fontWeight: "500",
                                },
                              }
                            );
                          }
                        }}
                        className="px-6 py-3 bg-brand text-brand-text border-0 rounded-full font-medium hover:bg-brand-dark hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
                      >
                        Approve
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Rejected Status Banner */}
            {sitter.approval_status === "Rejected" && sitter.admin_note && (
              <div className="mb-6 p-4 bg-muted border-l-4 border-red rounded-r-md">
                <div className="flex items-start gap-3">
                  <div className="text-red flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-red font-medium break-words">
                      <span className="font-medium">
                        Their request has not been approved:
                      </span>{" "}
                      &apos;{sitter.admin_note}&apos;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div>
              <div className="flex gap-5">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-6 py-4 font-medium rounded-t-lg transition-colors cursor-pointer ${
                    activeTab === "profile"
                      ? "text-brand bg-white border-l-4 border-brand"
                      : "text-gray-6 bg-muted hover:bg-gray-2"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("booking")}
                  className={`px-6 py-4 font-medium rounded-t-lg transition-colors cursor-pointer ${
                    activeTab === "booking"
                      ? "text-brand bg-white border-l-4 border-brand"
                      : "text-gray-6 bg-muted hover:bg-gray-2"
                  }`}
                >
                  Booking
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-6 py-4 font-medium rounded-t-lg transition-colors cursor-pointer ${
                    activeTab === "reviews"
                      ? "text-brand bg-white border-l-4 border-brand"
                      : "text-gray-6 bg-muted hover:bg-gray-2"
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-6 py-4 font-medium rounded-t-lg transition-colors cursor-pointer ${
                    activeTab === "history"
                      ? "text-brand bg-white border-l-4 border-brand"
                      : "text-gray-6 bg-muted hover:bg-gray-2"
                  }`}
                >
                  History
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-8">
              {activeTab === "profile" && <SitterProfile sitter={sitter} />}
              
              {activeTab === "booking" && (
                <SitterBookings
                  bookings={bookings}
                  loadingBookings={loadingBookings}
                  bookingDialogOpen={bookingDialogOpen}
                  onBookingDialogChange={setBookingDialogOpen}
                  selectedBooking={selectedBooking}
                  openBookingDetail={openBookingDetail}
                  totalPages={bookingTotalPages}
                  currentPage={bookingCurrentPage}
                  onPageChange={fetchBookings}
                  totalRecords={bookingTotalRecords}
                  itemsPerPage={bookingsPerPage}
                />
              )}

              {activeTab === "reviews" && <SitterReviews />}

              {activeTab === "history" && (
                <SitterHistory
                  historyData={historyData}
                  loadingHistory={loadingHistory}
                  totalPages={historyTotalPages}
                  currentPage={historyCurrentPage}
                  onPageChange={fetchHistory}
                  totalRecords={totalHistoryCount}
                  itemsPerPage={itemsPerPage}
                  getStatusKey={getStatusKey}
                />
              )}
            </div>

            {/* Reject Confirmation Modal */}
            {showRejectModal && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
              >
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 opacity-100">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-ink">
                      Reject Confirmation
                    </h2>
                    <button
                      onClick={() => setShowRejectModal(false)}
                      className="text-muted-text hover:text-ink transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xl font-medium text-ink">
                          Reason and suggestion
                        </label>
                      </div>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => {
                          if (e.target.value.length <= 200) {
                            setRejectReason(e.target.value);
                          }
                        }}
                        placeholder="Admin's suggestion here"
                        className="w-full h-32 px-3 py-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-xl"
                      />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <div
                        className={`inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full shadow-sm border ${
                          rejectReason.length >= 180
                            ? "text-red bg-red-50 border-red-200"
                            : rejectReason.length >= 100
                            ? "text-yellow bg-yellow-50 border-yellow-200"
                            : "text-muted-text bg-muted border-border"
                        }`}
                      >
                        <span className="font-medium">
                          {rejectReason.length}
                        </span>
                        <span
                          className={
                            rejectReason.length >= 180
                              ? "text-red"
                              : rejectReason.length >= 100
                              ? "text-yellow"
                              : "text-muted-text"
                          }
                        >
                          /
                        </span>
                        <span className="font-medium">200</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 p-6 border-t border-border">
                    <button
                      onClick={() => setShowRejectModal(false)}
                      className="px-4 py-2 text-brand bg-brand-bg rounded-full font-medium hover:bg-orange-2 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (!rejectReason.trim()) {
                            toast.error(
                              "Please provide a reason for rejection"
                            );
                            return;
                          }

                          const response = await axios.put(
                            "/api/admin/petsitter/reject",
                            {
                              sitterId: sitter.id,
                              adminNote: rejectReason,
                            }
                          );

                          if (response.status === 200) {
                            toast.success("Pet Sitter rejected successfully", {
                              duration: 2000,
                              style: {
                                background: "#10B981",
                                color: "#fff",
                                fontWeight: "500",
                              },
                            });

                            // Close modal first
                            setShowRejectModal(false);
                            setRejectReason("");

                            // Refresh after 2 seconds
                            setTimeout(() => {
                              window.location.reload();
                            }, 2000);
                          }
                        } catch (error) {
                          console.error("Error rejecting sitter:", error);
                          toast.error(
                            "Failed to reject pet sitter. Please try again.",
                            {
                              duration: 3000,
                              style: {
                                background: "#EF4444",
                                color: "#fff",
                                fontWeight: "500",
                              },
                            }
                          );
                        }
                      }}
                      className="px-4 py-2 bg-brand text-brand-text rounded-full font-medium hover:bg-brand-dark transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {isBookingDetailLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <PetPawLoading message="Loading Details..." size="md" />
        </div>
      )}
    </>
  );
}
