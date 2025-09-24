import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Species = "Cat" | "Dog" | "Bird" | "Rabbit" | (string & {});

export type PetCardProps = {
  name: string;
  species: Species;
  img: string;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;


  size?: number;
  width?: number;
  height?: number;


  avatarSize?: number;
};

const AVATAR_MIN = 64;
const AVATAR_MAX = 128;
const AVATAR_RATIO = 0.5; 

const CHIP_STYLES: Record<string, string> = {
  Dog: "bg-green-bg text-success ring-success",
  Cat: "bg-pink-bg text-pink ring-pink",
  Bird: "bg-blue-bg text-blue ring-blue",
  Rabbit: "bg-orange-1 text-orange-6 ring-orange-2",
  __: "bg-muted text-muted-text ring-border",
};

const Chip: React.FC<{ label: string }> = React.memo(({ label }) => {
  const chipColor = CHIP_STYLES[label] ?? CHIP_STYLES.__;
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-full px-3 text-[13px] font-medium ring-1 ring-inset",
        chipColor
      )}
    >
      {label}
    </span>
  );
});
Chip.displayName = "Chip";

export default function PetCard({
  name,
  species,
  img,
  selected = false,
  disabled = false,
  className,
  onClick,
  size = 240,
  width,
  height,
  avatarSize,
}: PetCardProps) {
  const boxW = width ?? size;
  const boxH = height ?? size;

  const autoAvatar = Math.round(Math.min(boxW, boxH) * AVATAR_RATIO);
  const avatar = Math.max(AVATAR_MIN, Math.min(AVATAR_MAX, avatarSize ?? autoAvatar));
  const evenAvatar = avatar % 2 === 0 ? avatar : avatar + 1;

  const handleClick = React.useCallback(() => {
    if (!disabled) onClick?.();
  }, [disabled, onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ width: boxW, height: boxH } as React.CSSProperties}
      className={cn(
        "relative flex flex-col items-center gap-4 bg-white p-6 transition",
        "rounded-[16px] border",
        selected ? "border-brand" : "border-border",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] active:scale-[.99]",
        className
      )}
      aria-pressed={selected}
      aria-disabled={disabled}
      role="button"
      data-state={selected ? "selected" : "default"}
      data-disabled={disabled ? "true" : "false"}
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


      <div
        style={{ width: evenAvatar, height: evenAvatar }}
        className="relative shrink-0 overflow-hidden rounded-full bg-muted"
        aria-hidden
      >
        <Image
          src={img}
          alt={name}
          fill
          sizes={`${evenAvatar}px`}
          className="object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <p className="text-[20px] font-semibold leading-6 text-ink text-center">{name}</p>
      <Chip label={species} />
    </button>
  );
}