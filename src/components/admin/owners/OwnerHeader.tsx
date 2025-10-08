import * as React from "react";
import OwnerTabs, { type OwnerTabValue } from "@/components/admin/owners/OwnerTabs";
import CloudAvatar from "@/components/admin/owners/CloudAvatar";

type Props = {
  title: string;
  tab: OwnerTabValue;
  onTabChange: (v: OwnerTabValue) => void;
  className?: string;
  owner?: {
    profile_image_public_id?: string | null;
    profile_image?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
};

export default function OwnerHeader({ title, tab, onTabChange, className, owner }: Props) {
  return (
    <header className={className}>
      <div className="flex items-center gap-4 px-6 pt-6">
        {owner ? (
          <CloudAvatar
            publicId={owner.profile_image_public_id ?? null}
            legacyUrl={owner.profile_image ?? null}
            alt={owner.name || owner.email || "avatar"}
            size={56}
            className="shrink-0"
            priority
          />
        ) : null}
        <h1 className="text-2xl font-semibold text-ink/90">{title}</h1>
      </div>

      <div className="px-10 pt-8">
        <OwnerTabs value={tab} onValueChange={onTabChange} />
      </div>
    </header>
  );
}