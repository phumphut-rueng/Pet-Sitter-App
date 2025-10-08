import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/utils";

export type PetSpecies = "Cat" | "Dog" | "Bird" | "Rabbit" | (string & {});

export type PetCardProps = {
  id?: number;
  name: string;
  species: PetSpecies;
  img?: string;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  onClickId?: (id: number) => void;
  size?: number;
  width?: number;
  height?: number;
  avatarSize?: number;
};

const AVATAR_CONFIG = {
  MIN: 64,
  MAX: 128,
  RATIO: 0.5,
  BASE_SIZE: 240,
} as const;

const DEFAULT_CARD_SIZE = 240;

const SPECIES_STYLES: Record<string, string> = {
  Dog: "bg-green-bg text-success ring-success",
  Cat: "bg-pink-bg text-pink ring-pink",
  Bird: "bg-blue-bg text-blue ring-blue",
  Rabbit: "bg-orange-1 text-orange-6 ring-orange-2",
  default: "bg-muted text-muted-text ring-border",
} as const;

const CARD_STYLES = {
  base: `
    relative flex flex-col items-center gap-4 bg-white p-6 transition
    rounded-[16px] border
  `,
  selected: "border-brand",
  unselected: "border-border",
  disabled: "cursor-not-allowed opacity-40",
  interactive: `
    cursor-pointer 
    hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] 
    active:scale-[.99]
  `,
  chip: `
    inline-flex h-8 items-center justify-center rounded-full 
    px-3 text-[13px] font-medium ring-1 ring-inset
  `,
  selectedBadge: `
    absolute right-6 top-6 inline-flex h-6 w-6 items-center 
    justify-center rounded-md bg-brand text-brand-text shadow-sm
  `,
  avatar: `
    relative shrink-0 overflow-hidden rounded-full bg-muted 
    flex items-center justify-center
  `,
  petName: "text-[20px] font-semibold leading-6 text-ink text-center",
  noImage: "text-muted-text text-sm",
} as const;

const calculateAvatarSize = (cardHeight: number, customAvatarSize?: number): number => {
  if (customAvatarSize) {
    return Math.max(AVATAR_CONFIG.MIN, Math.min(AVATAR_CONFIG.MAX, customAvatarSize));
  }
  const autoSize = Math.round(Math.min(AVATAR_CONFIG.BASE_SIZE, cardHeight) * AVATAR_CONFIG.RATIO);
  const clampedSize = Math.max(AVATAR_CONFIG.MIN, Math.min(AVATAR_CONFIG.MAX, autoSize));
  return clampedSize % 2 === 0 ? clampedSize : clampedSize + 1;
};

const getSpeciesStyle = (species: string): string => {
  return SPECIES_STYLES[species] ?? SPECIES_STYLES.default;
};

const SpeciesChip: React.FC<{ species: string }> = React.memo(({ species }) => {
  const chipStyle = getSpeciesStyle(species);
  return <span className={cn(CARD_STYLES.chip, chipStyle)}>{species}</span>;
});
SpeciesChip.displayName = "SpeciesChip";

const SelectedBadge: React.FC = React.memo(() => (
  <span className={CARD_STYLES.selectedBadge}>
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path fill="currentColor" d="M9.55 17.05 4.5 12l1.41-1.41 3.64 3.64 8.54-8.54L19.5 7.1z" />
    </svg>
  </span>
));
SelectedBadge.displayName = "SelectedBadge";

const PetAvatar: React.FC<{
  src: string;
  name: string;
  size: number;
  priority?: boolean;
  onError: () => void;
}> = React.memo(({ src, name, size, priority = false, onError }) => {
  const hasImage = src.trim().length > 0;
  return (
    <div style={{ width: size, height: size }} className={CARD_STYLES.avatar} aria-hidden>
      {hasImage ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          priority={priority}
          onError={onError}
        />
      ) : (
        <span className={CARD_STYLES.noImage}>No image</span>
      )}
    </div>
  );
});
PetAvatar.displayName = "PetAvatar";

const useImageState = (initialImage?: string) => {
  const [imageSrc, setImageSrc] = React.useState<string>((initialImage ?? "").trim());

  React.useEffect(() => {
    setImageSrc((initialImage ?? "").trim());
  }, [initialImage]);

  const handleImageError = React.useCallback(() => setImageSrc(""), []);

  return { imageSrc, handleImageError };
};

const useCardDimensions = (size: number, width?: number, height?: number) =>
  React.useMemo(
    () => ({
      width: width ?? "100%",
      minHeight: height ?? size,
    }),
    [size, width, height]
  );

const useUnifiedInteraction = (
  disabled: boolean,
  id: number | undefined,
  onClick?: () => void,
  onClickId?: (id: number) => void
) => {
  const handle = React.useCallback(() => {
    if (disabled) return;
    if (onClickId && typeof id === "number") onClickId(id);
    else onClick?.();
  }, [disabled, id, onClick, onClickId]);

  const handleKey = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handle();
      }
    },
    [disabled, handle]
  );

  return { handleClick: handle, handleKeyDown: handleKey };
};

function PetCard({
  id,
  name,
  species,
  img,
  selected = false,
  disabled = false,
  className,
  priority = false,
  onClick,
  onClickId,
  size = DEFAULT_CARD_SIZE,
  width,
  height,
  avatarSize,
}: PetCardProps) {
  const dimensions = useCardDimensions(size, width, height);
  const { imageSrc, handleImageError } = useImageState(img);
  const { handleClick, handleKeyDown } = useUnifiedInteraction(disabled, id, onClick, onClickId);

  const calculatedAvatarSize = React.useMemo(
    () => calculateAvatarSize(dimensions.minHeight as number, avatarSize),
    [dimensions.minHeight, avatarSize]
  );

  const cardClassName = cn(
    CARD_STYLES.base,
    selected ? CARD_STYLES.selected : CARD_STYLES.unselected,
    disabled ? CARD_STYLES.disabled : CARD_STYLES.interactive,
    className
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={dimensions as React.CSSProperties}
      className={cardClassName}
      aria-pressed={selected}
      aria-disabled={disabled}
      role="button"
      title={`${name} • ${species}`}
      data-state={selected ? "selected" : "default"}
      data-disabled={disabled ? "true" : "false"}
    >
      {selected && <SelectedBadge />}

      <PetAvatar 
        src={imageSrc} 
        name={name} 
        size={calculatedAvatarSize} 
        priority={priority}
        onError={handleImageError} 
      />

      <p className={CARD_STYLES.petName}>{name}</p>

      <SpeciesChip species={species} />
    </button>
  );
}

export default React.memo(PetCard);