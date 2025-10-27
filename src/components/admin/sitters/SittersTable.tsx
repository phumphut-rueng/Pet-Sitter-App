import Link from "next/link";
import { StatusBadge, StatusKey } from "@/components/badges/StatusBadge";
import CloudAvatar from "../owners/CloudAvatar";

interface SitterData {
  id: number;
  name: string;
  phone: string;
  experience: string;
  introduction: string;
  location_description: string;
  service_description: string;
  address_detail: string;
  address_province: string;
  address_district: string;
  address_sub_district: string;
  address_post_code: string;
  approval_status_id: number;
  approval_status: string;
  status_description: string;
  average_rating: number;
  user_name: string;
  user_email: string;
  user_dob: string;
  user_profile_image: string;
  sitter_image: Array<{
    id: number;
    image_url: string;
  }>;
  sitter_pet_type: Array<{
    pet_type: {
      pet_type_name: string;
    };
  }>;
  created_at: string;
  status_updated_at: string;
}

export default function SittersTable({ rows }: { rows: SitterData[] }) {
  // ฟังก์ชันสำหรับแปลงสถานะเป็น StatusKey
  const getStatusKey = (status: string): StatusKey => {
    switch (status) {
      case "Waiting for approve":
        return "waitingApprove";
      case "Approved":
        return "approved";
      case "Rejected":
        return "rejected";
      default:
        return "waitingApprove"; // fallback เป็น waitingApprove
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg">
      <table className="min-w-full">
        <thead>
          <tr className="bg-ink/90 text-white">
            <th className="px-5 py-3 text-xs2-medium text-left">Full Name</th>
            <th className="px-5 py-3 text-xs2-medium text-left">Pet Sitter Name</th>
            <th className="px-5 py-3 text-xs2-medium text-left">Email</th>
            <th className="px-5 py-3 text-xs2-medium text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-5 py-8 text-center text-xs2-medium text-muted-text"
              >
                No data
              </td>
            </tr>
          ) : (
            rows.map((sitter) => {
              const statusKey = getStatusKey(sitter.approval_status);
              return (
                <tr
                  key={sitter.id}
                  className="border-t border-border last:border-b hover:bg-muted/20"
                >
                  {/* Full Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <CloudAvatar
                        publicId={null}
                        legacyUrl={sitter.user_profile_image}
                        alt={sitter.user_name || sitter.user_email}
                        size={40}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/petsitter/${sitter.id}`}
                          className="block max-w-[220px] truncate hover:underline focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg rounded"
                        >
                          <div className="text-sm2-medium text-left text-ink truncate">
                            {sitter.user_name || sitter.user_email || "(no name)"}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </td>

                  {/* Pet Sitter Name */}
                  <td className="px-5 py-4 text-sm2-medium text-left text-ink">
                    {sitter.name || "No trade name"}
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 text-sm2-medium text-left text-ink">
                    {sitter.user_email}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={statusKey} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
