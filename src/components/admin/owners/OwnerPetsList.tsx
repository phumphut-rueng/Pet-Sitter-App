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
        <div className="text-gray-500">No pets.</div>
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