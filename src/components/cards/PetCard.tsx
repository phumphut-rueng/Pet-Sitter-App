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
  let chipColor = "bg-muted text-muted-text ring-border";
  
  if (label === "Dog") chipColor = "bg-green-bg text-success ring-success";
  if (label === "Cat") chipColor = "bg-pink-bg text-pink ring-pink";
  if (label === "Bird") chipColor = "bg-blue-bg text-blue ring-blue";
  if (label === "Rabbit") chipColor = "bg-orange-1 text-orange-6 ring-orange-2";

  return (
    <span className={`inline-flex h-8 items-center justify-center rounded-full px-3 text-[13px] font-medium ring-1 ring-inset ${chipColor}`}>
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
  let buttonClass = "relative flex w-[240px] h-[240px] flex-col items-center gap-4 rounded-[16px] border bg-white p-6 transition ";
  
  if (selected) {
    buttonClass += "border-brand ";
  } else {
    buttonClass += "border-border ";
  }
  
  if (disabled) {
    buttonClass += "opacity-40 cursor-not-allowed";
  } else {
    buttonClass += "cursor-pointer hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] active:scale-[.99]";
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={`${buttonClass} ${className}`}
    >
      {selected && (
        <span className="absolute right-6 top-6 inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand text-brand-text shadow-sm">
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
            <path
              fill="currentColor"
              d="M9.55 17.05 4.5 12l1.41-1.41 3.64 3.64 8.54-8.54L19.5 7.1z"
            />
          </svg>
        </span>
      )}

      <div className="h-[104px] w-[104px] overflow-hidden rounded-full bg-muted">
        <img src={img} alt={name} className="h-full w-full object-cover" />
      </div>

      <p className="text-[20px] font-semibold leading-6 text-ink">{name}</p>

      <Chip label={species} />
    </button>
  );
}