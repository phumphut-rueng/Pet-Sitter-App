import CloudAvatar from "@/components/admin/owners/CloudAvatar";

const formatDob = (s?: string | null) => {
  if (!s) return "-";
  const d = new Date(`${s}T00:00:00Z`);
  return isNaN(d.getTime())
    ? s
    : d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};


function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="h4-bold text-gray-4 mb-1">
        {label}
      </div>
      <div className="text-sm2-regular text-ink">
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
    "px-6 py-3 rounded-xl text-sm2-bold transition-colors text-orange-5 hover:bg-orange-5/10 active:bg-orange-5/15 focus:outline-none focus:ring-2 focus:ring-orange-5/30";

  return (
    <div className="px-10 pb-10 pt-6">
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

        <div className="min-h-[360px] flex-1 rounded-lg bg-white-1 p-6">
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