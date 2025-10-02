import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { StatusBadge, StatusKey } from "@/components/badges/StatusBadge";
import { PetTypeBadge, PetTypeKey } from "@/components/badges/PetTypeBadge";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import axios from "axios";

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
  const [activeTab, setActiveTab] = useState<"profile" | "booking" | "reviews">(
    "profile"
  );

  useEffect(() => {
    if (id) {
      fetchSitterDetail();
    }
  }, [id]);

  const fetchSitterDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/get-sitter-by-id?id=${id}`);
      setSitter(response.data);
    } catch (error) {
      console.error("Error fetching sitter detail:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pet Sitter Not Found
          </h1>
          <Link
            href="/admin/petsitter"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Pet Sitters
          </Link>
        </div>
      </div>
    );
  }

  const initials = sitter.user_name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/petsitter"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 group"
              >
                <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
              </Link>
              <div className="flex gap-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {sitter.user_name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={statusKey} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-orange-500 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                Reject
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Approve
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div>
          <div className="flex gap-5">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-4 font-medium rounded-t-lg transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "text-orange-500 bg-white"
                  : "text-gray-400 bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`px-6 py-4 font-medium rounded-t-lg transition-colors cursor-pointer ${
                activeTab === "booking"
                  ? "text-orange-500 bg-white"
                  : "text-gray-400 bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Booking
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 font-medium rounded-t-lg transition-colors cursor-pointer ${
                activeTab === "reviews"
                  ? "text-orange-500 bg-white"
                  : "text-gray-400 bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Reviews
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-8">
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              <div className="flex gap-10">
                {/* Left Column - Profile Image */}
                <div className="w-64 flex-shrink-0">
                  <div className="w-64 h-64 rounded-full overflow-hidden bg-gray-200">
                    {sitter.user_profile_image ? (
                      <img
                        src={sitter.user_profile_image}
                        alt={sitter.user_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-4xl font-bold text-gray-500">
                          {sitter.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="flex-1 rounded-md bg-[#FAFAFB]">
                  <div className="space-y-10 py-5 px-8">
                    <div>
                      <label className="h4 font-medium text-gray-400">
                        Full Name
                      </label>
                      <p className="text-xl font-medium mt-1">
                        {sitter.user_name}
                      </p>
                    </div>

                    <div>
                      <label className="h4 font-medium text-gray-400">
                        Experience
                      </label>
                      <p className="text-xl font-medium mt-1">
                        {sitter.experience || 0} Years
                      </p>
                    </div>

                    <div>
                      <label className="h4 font-medium text-gray-400">
                        Phone
                      </label>
                      {sitter.phone ? (
                        <p className="text-xl font-medium mt-1">
                          {sitter.phone}
                        </p>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No phone provided
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="h4 font-medium text-gray-400">
                        Date of Birth
                      </label>
                      {formatDateOfBirth(sitter.user_dob) ? (
                        <p className="text-xl font-medium mt-1">
                          {formatDateOfBirth(sitter.user_dob)}
                        </p>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No date of birth provided
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="h4 font-medium text-gray-400">
                        Introduction
                      </label>
                      {sitter.introduction ? (
                        <p className="text-xl font-medium mt-1 leading-relaxed">
                          {sitter.introduction}
                        </p>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No introduction provided
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10 py-9 px-8 rounded-md bg-[#FAFAFB]">
                {/* Pet Sitter Name */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-500">
                    Pet sitter name (Trade Name)
                  </h3>
                  {sitter.name ? (
                    <p className="text-xl font-bold text-gray-900">
                      {sitter.name}
                    </p>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No trade name available
                    </div>
                  )}
                </div>

                {/* Pet Type */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-500">
                    Pet type
                  </h3>
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
                    <div className="text-center py-8 text-gray-500">
                      No pet types available
                    </div>
                  )}
                </div>

                {/* Services */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-500">
                    Services
                  </h3>
                  {sitter.service_description ? (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {sitter.service_description}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No services available
                    </div>
                  )}
                </div>

                {/* My Place */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-500">
                    My Place
                  </h3>
                  {sitter.location_description ? (
                    <p className="text-gray-700 leading-relaxed">
                      {sitter.location_description}
                    </p>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No place description provided
                    </div>
                  )}
                </div>

                {/* Image Gallery */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-500">
                    Image Gallery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sitter.sitter_image && sitter.sitter_image.length > 0 ? (
                      sitter.sitter_image.map((image, index) => (
                        <div
                          key={index}
                          className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-200"
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
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        No images available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8 py-9 px-8 rounded-md bg-[#FAFAFB]">
                {/* Address */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-500">
                  Address
                </h3>
                {sitter.address_detail || sitter.address_province || sitter.address_district || sitter.address_sub_district || sitter.address_post_code ? (
                  <div className="text-gray-700 leading-relaxed">
                    {sitter.address_detail && (
                      <div>{sitter.address_detail}</div>
                    )}
                    {(sitter.address_sub_district || sitter.address_district || sitter.address_province || sitter.address_post_code) && (
                      <div>
                        {[sitter.address_sub_district, sitter.address_district, sitter.address_province, sitter.address_post_code]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No address available
                  </div>
                )}
              </div>

              {/* Location Map */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-500">
                  Location Map
                </h3>
                {sitter.address_detail || sitter.address_province || sitter.address_district || sitter.address_sub_district || sitter.address_post_code ? (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">📍</div>
                      <div>Location Map</div>
                      <div className="text-sm mt-1">(Mock Image)</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No location available
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {activeTab === "booking" && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Booking Information
              </h3>
              <p className="text-gray-600">
                Booking details will be displayed here.
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Reviews
              </h3>
              <p className="text-gray-600">
                Customer reviews will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
