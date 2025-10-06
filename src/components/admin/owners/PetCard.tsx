import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/utils";

export type PetCardProps = {
  name: string;
  typeLabel?: string;
  imageUrl?: string | null;
  onClick?: () => void;
};

export default function PetCard({ name, typeLabel, imageUrl, onClick }: PetCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-[260px] rounded-2xl border border-gray-200 bg-white p-6 text-left",
        "hover:shadow-sm transition-shadow cursor-pointer"
      )}
    >
      <div className="mx-auto h-[96px] w-[96px] rounded-full overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} width={96} height={96} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full rounded-full bg-gray-200 grid place-items-center text-gray-600">
            {name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <div className="font-medium text-ink/90">{name || "-"}</div>
        {typeLabel && (
          <div className="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-sm text-ink/70">
            {typeLabel}
          </div>
        )}
      </div>
    </button>
  );
}