import * as React from "react";

type Props = {
  name: string;
  species: "Cat" | "Dog" | "Bird" | "Rabbit" | string;
  img: string;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

function Chip({ label }: { label: string }) {
  const palette: Record<string, string> = {
    Dog: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    Cat: "bg-pink-50 text-pink-600 ring-pink-200",
    Bird: "bg-sky-50 text-sky-600 ring-sky-200",
    Rabbit: "bg-orange-50 text-orange-600 ring-orange-200",
  };
  return (
    <span
      className={`inline-flex h-8 items-center justify-center rounded-full px-3 text-[13px] font-medium ring-1 ring-inset ${
        palette[label] || "bg-gray-50 text-gray-600 ring-gray-200"
      }`}
    >
      {label}
    </span>
  );
}

export default function PetCard({
  name,
  species,
  img,
  selected = false,
  disabled = false,
  className = "",
  onClick,
}: Props) {
  const base =
    "relative flex w-[240px] h-[240px] flex-col items-center gap-4 rounded-[16px] border bg-white p-6 transition ";
  const borderSel = selected ? "border-[#FF7037]" : "border-[#DCDFED]";
  const state = disabled
    ? "opacity-40 cursor-not-allowed"
    : "cursor-pointer hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] active:scale-[.99]";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={[base, borderSel, state, className].join(" ")}
    >
    
      {selected && (
        <span className="absolute right-6 top-6 inline-flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-white shadow-sm">
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
            <path
              fill="currentColor"
              d="M9.55 17.05 4.5 12l1.41-1.41 3.64 3.64 8.54-8.54L19.5 7.1z"
            />
          </svg>
        </span>
      )}

      
      <div className="h-[104px] w-[104px] overflow-hidden rounded-full bg-gray-100">
        <img src={img} alt={name} className="h-full w-full object-cover" />
      </div>

     
      <p className="text-[20px] font-semibold leading-6 text-[#323640]">{name}</p>

      
      <Chip label={species} />
    </button>
  );
}