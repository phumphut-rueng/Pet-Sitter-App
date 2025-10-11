import * as React from "react";
import PetCard from "@/components/cards/PetCard";
import type { PetSpecies } from "@/components/cards/PetCard";
import type { PetItem } from "@/types/admin/owners"; 

type Props = {
  pets: PetItem[];
  onPetClick?: (p: PetItem) => void;
};

// --- Cloudinary helper -------------------------------------------------
const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "df1j8dvg0";

/** แปลง image_url เป็น URL พร้อม transformation 320x320 */
function toCldThumb(src?: string | null, size = 320): string | undefined {
  if (!src) return undefined;
  const val = src.trim();
  if (!val) return undefined;

  // URL เต็ม
  if (/^https?:\/\//i.test(val)) {
    try {
      const u = new URL(val);
      if (u.hostname === "res.cloudinary.com" && u.pathname.includes("/upload/")) {
        const [before, after] = u.pathname.split("/upload/");
        u.pathname = `${before}/upload/f_auto,q_auto,c_fill,w_${size},h_${size}/${after}`.replace(/\/{2,}/g, "/");
        return u.toString();
      }
      return val;
    } catch {
      // ถ้า parse ไม่ได้ ให้ถือเป็น public_id ต่อ
    }
  }

  // public_id (ตัดนามสกุลทิ้ง)
  const pid = val.replace(/\.[a-z0-9]+$/i, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_fill,w_${size},h_${size}/${pid}`;
}

// species ที่โชว์บนชิป
function normalizeSpecies(name?: string | null): PetSpecies {
  if (!name) return "Unknown" as PetSpecies;
  const s = name.trim();
  if (!s) return "Unknown" as PetSpecies;
  return (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) as PetSpecies;
}

export default function OwnerPetsList({ pets, onPetClick }: Props) {
  return (
    <div className="px-10 pb-10 pt-6">
      {pets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-gray-1 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-4 text-base-medium text-ink">No pets yet</p>
          <p className="mt-1 text-sm2-regular text-gray-6">
            This owner hasn&apos;t added any pets
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((p) => (
            <PetCard
              key={p.id}
              id={p.id}
              name={p.name ?? "(no name)"}
              species={normalizeSpecies(p.pet_type_name)}
              img={toCldThumb(p.image_url, 320)}
              onClick={() => onPetClick?.(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}