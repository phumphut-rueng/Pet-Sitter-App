import * as React from "react";
import CloudAvatar from "./CloudAvatar";

export default function PetCard({
  name,
  typeLabel,
  imageUrl,
  isBanned = false,
  onClick,
}: {
  name: string;
  typeLabel?: string;
  imageUrl?: string;
  isBanned?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-gray-200 bg-white p-6 text-left hover:shadow-sm transition-shadow cursor-pointer"
    >
      <div className="flex flex-col items-center gap-3">
        <CloudAvatar
          legacyUrl={imageUrl}
          alt={name}
          size={88}
          className="shrink-0"
        />

        <div className="font-medium text-ink/90">{name}</div>

        <div className="mt-1">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
              isBanned
                ? "bg-red/10 text-red border border-red/30"
                : "bg-green/10 text-green border border-green/30"
            }`}
          >
            {isBanned ? "Suspended" : typeLabel || "—"}
          </span>
        </div>
      </div>
    </button>
  );
}