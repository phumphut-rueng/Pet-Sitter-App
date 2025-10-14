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
      className="group w-full rounded-2xl border border-gray-2 bg-white p-6 text-left hover:shadow-md transition-shadow cursor-pointer focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg"
    >
      <div className="flex flex-col items-center gap-3">
        <CloudAvatar
          legacyUrl={imageUrl}
          alt={name}
          size={88}
          priority
          className="shrink-0"
        />

        <div className="text-base-medium text-ink">{name}</div>

        <div className="mt-1">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs2-medium ${
              isBanned
                ? "bg-pink-bg text-red border border-red/30"
                : "bg-green-light text-green border border-green/30"
            }`}
          >
            {isBanned ? "Suspended" : typeLabel || "—"}
          </span>
        </div>
      </div>
    </button>
  );
}