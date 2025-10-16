import * as React from "react";
import Image from "next/image";


export type PetSitterCardProps = {
  title: string;
  hostName: string;
  location: string;
  rating?: number;
  tags: string[];
  coverUrl: string;
  avatarUrl?: string;
  className?: string;
  priority?: boolean;
};


const TAG_COLORS = {
  Dog: "bg-green-bg text-success ring-success",
  Cat: "bg-pink-bg text-pink ring-pink",
  Bird: "bg-blue-bg text-blue ring-blue",
  Rabbit: "bg-orange-1 text-orange-4 ring-orange-4",
  default: "bg-muted text-muted-text ring-border",
} as const;

const RATING_SIZES = {
  sm: "h-[14px] w-[14px]",
  md: "h-5 w-5",
} as const;

const CARD_STYLES = {
  tag: `
    inline-flex h-8 items-center rounded-full px-3 text-[14px] 
    font-medium ring-1 ring-inset whitespace-nowrap shrink-0
  `,
} as const;


const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

const getTagColor = (tag: string): string =>
  TAG_COLORS[tag as keyof typeof TAG_COLORS] ?? TAG_COLORS.default;


const LocationIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className}>
    <path
      fill="currentColor"
      d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.15 6.35 11.63 6.62 11.9.49.49 1.27.49 1.76 0 .27-.27 6.62-6.75 6.62-11.9C19.5 5.36 16.14 2 12 2zm0 10.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5z"
    />
  </svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={cn("fill-current", className)}>
    <path d="M12 3.75l2.72 5.51 6.08.88-4.4 4.29 1.04 6.07L12 17.77l-5.44 2.85 1.04-6.07-4.4-4.29 6.08-.88L12 3.75z" />
  </svg>
);


const StarRating: React.FC<{ value: number; size: keyof typeof RATING_SIZES }> = React.memo(
  ({ value = 0, size = "md" }) => {
    const starSize = RATING_SIZES[size];
    const stars = React.useMemo(() => {
      const result: (1 | 0.5 | 0)[] = [];
      for (let i = 0; i < 5; i++) {
        if (i < Math.floor(value)) result.push(1);
        else if (i === Math.floor(value) && value % 1 >= 0.5) result.push(0.5);
        else result.push(0);
      }
      return result;
    }, [value]);

    return (
      <div className="flex items-center gap-1 text-success">
        {stars.map((star, i) => (
          <div key={i} className={starSize}>
            {star === 1 ? (
              <StarIcon className={starSize} />
            ) : star === 0.5 ? (
              <div className="relative">
                <StarIcon className={starSize} />
                <div className="absolute inset-y-0 right-0 w-1/2 bg-white" />
              </div>
            ) : (
              <div className="opacity-30">
                <StarIcon className={starSize} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);
StarRating.displayName = "StarRating";

const TagChip: React.FC<{ label: string }> = React.memo(({ label }) => {
  const colorClass = getTagColor(label);
  return <span className={cn(CARD_STYLES.tag, colorClass)}>{label}</span>;
});
TagChip.displayName = "TagChip";


const PetSitterCardLargeBase: React.FC<PetSitterCardProps> = ({
  title,
  hostName,
  location,
  rating = 5,
  tags,
  coverUrl,
  avatarUrl,
  className,
  priority = false,
}) => {
  return (
    <article
      tabIndex={0}
      className={cn(
        "group grid cursor-pointer grid-cols-1 lg:grid-cols-[224px_1fr] gap-4 rounded-2xl border border-border bg-white p-4 hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] focus-visible:outline-none",
        className
      )}
    >
      {/* Mobile Layout - Cover Image */}
      <div className="block lg:hidden">
        <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted mb-4">
          <Image 
            src={coverUrl} 
            alt="" 
            fill
            className="object-cover" 
            sizes="100vw"
            priority={priority}
          />
        </div>
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-muted">
            <Image 
              src={avatarUrl || coverUrl} 
              alt="" 
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-ink line-clamp-2 mb-1">{title}</h3>
            <p className="text-sm text-muted-text mb-2">By {hostName}</p>
            <div className="flex items-center gap-1 text-muted-text mb-2">
              <LocationIcon className="h-4 w-4" />
              <span className="text-sm">{location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => <TagChip key={tag} label={tag} />)}
              </div>
              <div className="flex-shrink-0">
                <StarRating value={rating} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:contents">
        <div className="relative h-40 w-56 overflow-hidden rounded-xl bg-muted self-center">
          <Image 
            src={coverUrl} 
            alt="" 
            fill
            className="object-cover" 
            sizes="224px"
            priority={priority}
          />
        </div>
        <div className="min-w-0 self-center space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image 
                  src={avatarUrl || coverUrl} 
                  alt="" 
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-[21px] leading-8 font-semibold text-ink line-clamp-2">{title}</h3>
                <p className="truncate text-[14px] leading-5 text-muted-text">By {hostName}</p>
              </div>
            </div>
            <div className="shrink-0 translate-y-[2px]">
              <StarRating value={rating} size="md" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-text">
            <LocationIcon />
            <span className="truncate text-[14px] leading-5">{location}</span>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2">
            {tags.map((tag) => <TagChip key={tag} label={tag} />)}
          </div>
        </div>
      </div>
    </article>
  );
};

export const PetSitterCardLarge = React.memo(PetSitterCardLargeBase);

export default PetSitterCardLarge;