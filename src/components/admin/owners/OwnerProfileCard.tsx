import CloudAvatar from "@/components/admin/owners/CloudAvatar";

const formatDob = (s?: string | null) => {
  if (!s) return "-";
  
  // ถ้าเป็น ISO string อยู่แล้ว (มี T) ใช้ตรงๆ
  // ถ้าเป็น date-only (YYYY-MM-DD) ให้เพิ่ม T00:00:00Z
  const dateStr = s.includes("T") ? s : `${s}T00:00:00Z`;
  const d = new Date(dateStr);
  
  return isNaN(d.getTime())
    ? s
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm2-medium text-gray-6 mb-1">
        {label}
      </div>
      <div className="text-base-medium text-ink">
        {value}
      </div>
    </div>
  );
}

export default function OwnerProfileCard({
  owner,
  isSuspended = false,
  onClickBan,
}: {
  owner: {
    name: string | null;
    email: string;
    phone: string | null;
    id_number?: string | null;
    dob?: string | null;
    profile_image_public_id?: string | null;
    profile_image?: string | null;
  };
  isSuspended?: boolean;
  onClickBan: () => void;
}) {
  const btnLabel = isSuspended ? "Unban This User" : "Ban This User";
  const btnClass =
    "px-6 py-3 rounded-xl text-sm2-medium transition-colors text-orange-5 hover:bg-orange-1 active:bg-orange-2 focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg";

  return (
    <div className="px-10 py-10 bg-white rounded-br-2xl rounded-tr-2xl">
    <div className="flex items-start gap-10">
        {/* Avatar ซ้าย */}
        <CloudAvatar
          publicId={owner.profile_image_public_id ?? undefined}
          legacyUrl={owner.profile_image ?? undefined}
          alt={owner.name || owner.email}
          size={220}
          className="shrink-0"
          priority
        />

        <div className="min-h-[360px] flex-1 rounded-lg p-6">
          {/* ระยะห่างระหว่างหัวข้อ = 40px → space-y-10 */}
          <div className="space-y-10">
            <Field label="Pet Owner Name" value={owner.name || "-"} />
            <Field label="Email" value={owner.email} />
            <Field label="Phone" value={owner.phone || "-"} />
            <Field label="ID Number" value={owner.id_number || "-"} />
            <Field label="Date of Birth" value={formatDob(owner.dob)} />
          </div>

          {/* ปุ่มมุมขวาล่าง */}
          <div className="mt-10 flex justify-end">
            <button onClick={onClickBan} className={btnClass}>
              {btnLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}