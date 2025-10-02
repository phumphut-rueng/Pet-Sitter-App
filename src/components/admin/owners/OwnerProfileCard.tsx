import CloudAvatar from "@/components/admin/owners/CloudAvatar";

const formatDob = (s?: string | null) => {
  if (!s) return "-";
  const d = new Date(`${s}T00:00:00Z`);
  return isNaN(d.getTime())
    ? s
    : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}

export default function OwnerProfileCard({
  owner,
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
  onClickBan: () => void;
}) {
  return (
    <div className="px-10 pb-10 pt-6">
      <div className="flex gap-10 items-start">
        <CloudAvatar
          publicId={owner.profile_image_public_id ?? undefined}
          legacyUrl={owner.profile_image ?? "/icons/avatar-placeholder.svg"}
          alt={owner.name || owner.email}
          size={200}
          className="shrink-0"
        />

        <div className="flex-1 bg-[#FAFAFB] rounded-lg p-6 min-h-[400px]">
          <div className="space-y-8">
            <Field label="Pet Owner Name" value={owner.name || "-"} />
            <Field label="Email" value={owner.email} />
            <Field label="Phone" value={owner.phone || "-"} />
            <Field label="ID Number" value={owner.id_number || "-"} />
            <Field label="Date of Birth" value={formatDob(owner.dob)} />
          </div>

          <div className="flex justify-end mt-10">
            <button
              onClick={onClickBan}
              className="px-6 py-3 rounded-xl  text-orange-500 font-medium hover:bg-orange-50 transition-colors"
            >
              Ban This User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}