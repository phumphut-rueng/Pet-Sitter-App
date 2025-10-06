import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, X } from "lucide-react";
import { StatusBadge, StatusKey } from "@/components/badges/StatusBadge";
import { PetTypeBadge, PetTypeKey } from "@/components/badges/PetTypeBadge";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { PetPawLoadingSmall } from "@/components/loading/PetPawLoadingSmall";
import { Pagination } from "@/components/pagination/Pagination";
import { PaginationInfo } from "@/components/pagination/PaginationInfo";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const itemsPerPage = 8;

  const fetchSitterDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/petsitter/get-sitter-by-id?id=${id}`);
      setSitter(response.data);
    } catch (error) {
      console.error("Error fetching sitter detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setLoadingHistory(true);
      const response = await axios.get(`/api/admin/petsitter/history?sitterId=${id}&page=${page}&limit=${itemsPerPage}`);
      if (response.status === 200) {
        setHistoryData(response.data.data);
        setTotalHistoryCount(response.data.pagination.totalRecords);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [id, itemsPerPage]);

  useEffect(() => {
    if (id) {
      fetchSitterDetail();
    }
  }, [id, fetchSitterDetail]);

  useEffect(() => {
    if (activeTab === "history" && id) {
      fetchHistory(currentPage);
    }
  }, [activeTab, id, currentPage, fetchHistory]);

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

  const getPetTypeKey = (petTypeName: string): PetTypeKey => {
    switch (petTypeName.toLowerCase()) {
      case "dog":
        return "dog";
      case "cat":
        return "cat";
      case "bird":
        return "bird";
      case "rabbit":
        return "rabbit";
      default:
        return "dog"; // fallback
    }
  };

  if (loading) {
    return <PetPawLoading message="Loading Pet Sitter Details" size="lg" />;
  }

  if (!sitter) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
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
      </div>
    );
  }


  const statusKey = getStatusKey(sitter.approval_status);

  const formatDateOfBirth = (dob: string) => {
    if (!dob) return null;
    const date = new Date(dob);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

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

      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex gap-6">
          <aside className="hidden md:block md:w-[240px] shrink-0">
            <AdminSidebar sticky />
          </aside>

          <main className="flex-1 min-w-0 px-4 py-6 lg:px-6">
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
              {activeTab === "profile" && (
                <div className="flex flex-col gap-6">
                  {/* ส่วน Profile (Full Name - Introduction) - แสดงทุกสถานะ */}
                  <div className="flex gap-10">
                    {/* Left Column - Profile Image */}
                    <div className="w-64 flex-shrink-0">
                      <div className="w-64 h-64 rounded-full overflow-hidden bg-muted">
                        {sitter.user_profile_image ? (
                          <Image
                            src={sitter.user_profile_image}
                            alt={sitter.user_name}
                            width={256}
                            height={256}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-4xl font-bold text-muted-text">
                              {sitter.user_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="flex-1 rounded-md bg-muted">
                      <div className="space-y-8 py-8 px-8">
                        <div>
                          <label className="text-xl font-medium text-muted-text">
                            Full Name
                          </label>
                          <p className="text-xl font-normal mt-3 text-ink">
                            {sitter.user_name}
                          </p>
                        </div>

                        <div>
                          <label className="text-xl font-medium text-muted-text">
                            Experience
                          </label>
                          <p className="text-xl font-normal mt-3 text-ink">
                            {sitter.experience || 0} Years
                          </p>
                        </div>

                        <div>
                          <label className="text-xl font-medium text-muted-text">
                            Phone
                          </label>
                          {sitter.phone ? (
                            <p className="text-xl font-normal mt-3 text-ink">
                              {sitter.phone}
                            </p>
                          ) : (
                            <div className="text-center py-8 text-muted-text text-xl">
                              No phone provided
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xl font-medium text-muted-text">
                            Date of Birth
                          </label>
                          {formatDateOfBirth(sitter.user_dob) ? (
                            <p className="text-xl font-normal mt-3 text-ink">
                              {formatDateOfBirth(sitter.user_dob)}
                            </p>
                          ) : (
                            <div className="text-center py-8 text-muted-text text-xl">
                              No date of birth provided
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xl font-medium text-muted-text">
                            Introduction
                          </label>
                          {sitter.introduction ? (
                            <p className="text-xl font-normal mt-3 leading-relaxed text-ink">
                              {sitter.introduction}
                            </p>
                          ) : (
                            <div className="text-center py-8 text-muted-text text-xl">
                              No introduction provided
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ส่วน Pet Sitter + Address - แสดงเฉพาะเมื่อสถานะเป็น Approved */}
                  {sitter.approval_status === "Approved" && (
                    <>
                      {/* Pet Sitter Details */}
                      <div className="space-y-10 py-10 px-8 rounded-md bg-muted">
                        {/* Pet Sitter Name */}
                        <div className="space-y-3">
                          <h3 className="text-xl font-medium text-muted-text">
                            Pet sitter name (Trade Name)
                          </h3>
                          {sitter.name ? (
                            <p className="text-xl font-normal text-ink">
                              {sitter.name}
                            </p>
                          ) : (
                            <div className="text-center py-8 text-muted-text text-xl">
                              No trade name available
                            </div>
                          )}
                        </div>

                        {/* Pet Type */}
                        <div className="space-y-4">
                          <div className="text-xl font-medium text-muted-text">
                            Pet type
                          </div>
                          {sitter.sitter_pet_type &&
                          sitter.sitter_pet_type.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {sitter.sitter_pet_type.map((petType, index) => (
                                <PetTypeBadge
                                  key={index}
                                  typeKey={getPetTypeKey(
                                    petType.pet_type.pet_type_name
                                  )}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-text text-xl">
                              No pet types available
                            </div>
                          )}
                        </div>

                        {/* Services */}
                        <div className="space-y-4">
                          <div className="text-xl font-medium text-muted-text">
                            Services
                          </div>
                          {sitter.service_description ? (
                            <div className="text-xl font-normal leading-relaxed whitespace-pre-line text-ink">
                              {sitter.service_description}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-text text-xl">
                              No services available
                            </div>
                          )}
                        </div>

                        {/* My Place */}
                        <div className="space-y-4">
                          <div className="text-xl font-medium text-muted-text">
                            My Place
                          </div>
                          {sitter.location_description ? (
                            <p className="text-xl font-normal leading-relaxed text-ink">
                              {sitter.location_description}
                            </p>
                          ) : (
                            <div className="text-center py-8 text-muted-text text-xl">
                              No place description provided
                            </div>
                          )}
                        </div>

                        {/* Image Gallery */}
                        <div className="space-y-4">
                          <div className="text-xl font-medium text-muted-text">
                            Image Gallery
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {sitter.sitter_image &&
                            sitter.sitter_image.length > 0 ? (
                              sitter.sitter_image.map((image, index) => (
                                <div
                                  key={index}
                                  className="relative w-full h-64 rounded-lg overflow-hidden bg-muted"
                                >
                                  <Image
                                    src={image.image_url}
                                    alt={`Sitter image ${index + 1}`}
                                    width={300}
                                    height={256}
                                    className="object-cover"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                    }}
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="col-span-3 text-center py-8 text-muted-text text-xl">
                                No images available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Address and Location Map */}
                      <div className="space-y-10 py-10 px-8 rounded-md bg-muted">
                        {/* Address */}
                        <div className="space-y-3">
                          <div className="text-xl font-medium text-muted-text">
                            Address
                          </div>
                          {sitter.address_detail ||
                          sitter.address_province ||
                          sitter.address_district ||
                          sitter.address_sub_district ||
                          sitter.address_post_code ? (
                            <div className="text-xl font-normal leading-relaxed text-ink">
                              {sitter.address_detail && (
                                <div>{sitter.address_detail}</div>
                              )}
                              {(sitter.address_sub_district ||
                                sitter.address_district ||
                                sitter.address_province ||
                                sitter.address_post_code) && (
                                <div>
                                  {[
                                    sitter.address_sub_district,
                                    sitter.address_district,
                                    sitter.address_province,
                                    sitter.address_post_code,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-text text-xl">
                              No address available
                            </div>
                          )}
                        </div>

                        {/* Location Map */}
                        <div className="space-y-4">
                          <div className="text-xl font-medium text-muted-text">
                            Location Map
                          </div>
                          {sitter.address_detail ||
                          sitter.address_province ||
                          sitter.address_district ||
                          sitter.address_sub_district ||
                          sitter.address_post_code ? (
                            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                              <div className="text-center text-muted-text text-xl">
                                <div className="text-4xl mb-2">📍</div>
                                <div>Location Map</div>
                                <div className="text-sm mt-1">(Mock Image)</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-text text-xl">
                              No location available
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "booking" && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-ink mb-2">
                    Booking Information
                  </h3>
                  <p className="text-xl text-muted-text">
                    Booking details will be displayed here.
                  </p>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-ink mb-2">
                    Reviews
                  </h3>
                  <p className="text-xl text-muted-text">
                    Customer reviews will be displayed here.
                  </p>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-8">
                  <h3 className="text-xl font-semibold text-ink mb-6">
                    Approval History
                  </h3>

                  {loadingHistory ? (
                    <div className="flex justify-center py-8">
                      <PetPawLoadingSmall message="Loading History" />
                    </div>
                  ) : historyData.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-8 py-5 text-left text-sm font-medium text-muted-text uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-8 py-5 text-left text-sm font-medium text-muted-text uppercase tracking-wider">
                                Approved By
                              </th>
                              <th className="px-8 py-5 text-left text-sm font-medium text-muted-text uppercase tracking-wider">
                                Note
                              </th>
                              <th className="px-8 py-5 text-left text-sm font-medium text-muted-text uppercase tracking-wider">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-border">
                            {historyData.map((record: {
                              id: number;
                              statusName: string;
                              adminName?: string;
                              adminNote?: string;
                              changedAt: string;
                            }, index: number) => (
                              <tr
                                key={record.id}
                                className={
                                  index % 2 === 0 ? "bg-white" : "bg-muted"
                                }
                              >
                                <td className="px-8 py-6 whitespace-nowrap">
                                  <StatusBadge
                                    status={getStatusKey(record.statusName)}
                                  />
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-sm text-ink">
                                  {record.adminName || "System"}
                                </td>
                                <td className="px-8 py-6 text-sm text-ink">
                                  <div className="max-w-lg">
                                    <p className="text-sm text-muted-text break-words leading-relaxed">
                                      {record.adminNote || "No note provided"}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-sm text-muted-text">
                                  {new Date(
                                    record.changedAt
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-border">
                          <PaginationInfo
                            currentCount={historyData.length}
                            totalCount={totalHistoryCount}
                            currentPage={currentPage}
                            totalPages={totalPages}
                          />
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onClick={(page) => {
                              setCurrentPage(page);
                              fetchHistory(page);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-muted-text mb-4">
                        <svg
                          className="mx-auto h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-ink mb-2">
                        No History Found
                      </h3>
                      <p className="text-xl text-muted-text">
                        No approval history available for this pet sitter.
                      </p>
                    </div>
                  )}
                </div>
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
          </main>
        </div>
      </div>
    </>
  );
}
