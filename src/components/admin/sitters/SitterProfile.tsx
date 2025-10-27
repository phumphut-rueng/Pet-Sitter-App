import Image from "next/image";
import dynamic from "next/dynamic";
import { PetTypeBadge, PetTypeKey } from "@/components/badges/PetTypeBadge";

const LeafletMap = dynamic(() => import("@/components/form/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-xl border border-gray-200 grid place-items-center">
      <span className="text-sm text-gray-500">Loading map…</span>
    </div>
  ),
});

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

interface SitterProfileProps {
  sitter: SitterDetail;
}

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

const formatDateOfBirth = (dob: string) => {
  if (!dob) return null;
  const date = new Date(dob);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function SitterProfile({ sitter }: SitterProfileProps) {
  return (
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
                <p className="text-xl font-normal text-ink">{sitter.name}</p>
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
              {sitter.sitter_pet_type && sitter.sitter_pet_type.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sitter.sitter_pet_type.map((petType, index) => (
                    <PetTypeBadge
                      key={index}
                      typeKey={getPetTypeKey(petType.pet_type.pet_type_name)}
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
                {sitter.sitter_image && sitter.sitter_image.length > 0 ? (
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
              <div className="text-xl font-medium text-muted-text">Address</div>
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
                sitter.latitude && sitter.longitude ? (
                  <LeafletMap
                    latitude={sitter.latitude}
                    longitude={sitter.longitude}
                    zoom={15}
                    className="h-[300px] w-full rounded-xl border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-text text-xl">
                      <div className="text-4xl mb-2">📍</div>
                      <div>Location coordinates not available</div>
                      <div className="text-sm mt-1">
                        Address: {sitter.address_detail || "No address detail"}
                      </div>
                    </div>
                  </div>
                )
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
  );
}
