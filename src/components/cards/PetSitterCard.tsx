//เดะมีแก้ต่อ

import * as React from "react";

type Size = "lg" | "sm";
type Variant = "default" | "chips" | "compact";

export type PetSitterCardProps = {
  size?: Size;
  variant?: Variant;
  title: string;
  hostName: string;
  location: string;
  rating?: number;
  tags: string[];
  coverUrl: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  className?: string;
};

function cn(...xs: Array<string | undefined | false | null>) {
  return xs.filter(Boolean).join(" ");
}

const IconLocation = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className}>
    <path
      fill="currentColor"
      d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.15 6.35 11.63 6.62 11.9.49.49 1.27.49 1.76 0 .27-.27 6.62-6.75 6.62-11.9C19.5 5.36 16.14 2 12 2zm0 10.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5z"
    />
  </svg>
);

const IconStar = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={cn("fill-current", className)}>
    <path d="M12 3.75l2.72 5.51 6.08.88-4.4 4.29 1.04 6.07L12 17.77l-5.44 2.85 1.04-6.07-4.4-4.29 6.08-.88L12 3.75z" />
  </svg>
);

function Rating({ value = 0, size = "md" }: { value?: number; size?: "sm" | "md" }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const arr = Array.from({ length: 5 }, (_, i) => (i < full ? 1 : i === full && half ? 0.5 : 0));
  const starBox = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex items-center gap-1 text-success">
      {arr.map((s, i) => (
        <div key={i} className={starBox}>
          {s === 1 ? (
            <IconStar className={starBox} />
          ) : s === 0.5 ? (
            <div className="relative">
              <IconStar className={starBox} />
              <div className="absolute inset-y-0 right-0 w-1/2 bg-white" />
            </div>
          ) : (
            <div className="opacity-30">
              <IconStar className={starBox} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  const palette: Record<string, string> = {
    Dog: "bg-green-bg text-success ring-success",
    Cat: "bg-pink-bg text-pink ring-pink",
    Bird: "bg-blue-bg text-blue ring-blue",
    Rabbit: "bg-orange-1 text-orange-6 ring-orange-2",
  };
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium ring-1 ring-inset",
        palette[label] || "bg-muted text-muted-text ring-border"
      )}
    >
      {label}
    </span>
  );
}

export function PetSitterCard({
  size = "lg",
  variant = "default",
  title,
  hostName,
  location,
  rating = 5,
  tags,
  coverUrl,
  avatarUrl,
  showAvatar,
  className,
}: PetSitterCardProps) {
  const isSm = size === "sm";
  const showAvatarComputed = showAvatar ?? !isSm;

  const gridCols =
    variant === "chips"
      ? isSm
        ? "grid-cols-[112px_1fr_auto]"
        : "grid-cols-[560px_1fr_auto]"
      : variant === "compact"
      ? isSm
        ? "grid-cols-[112px_1fr_auto]"
        : "grid-cols-[224px_1fr_auto]"
      : isSm
      ? "grid-cols-[112px_1fr]"
      : "grid-cols-[224px_1fr_auto]";

  return (
    <article
      tabIndex={0}
      className={cn(
        "group grid rounded-2xl border border-border bg-white transition-shadow cursor-pointer hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] focus-visible:outline-none",
        gridCols,
        isSm ? "gap-3 p-3" : "gap-4 p-4",
        className
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-xl bg-muted",
          variant === "chips"
            ? isSm
              ? "h-24 w-28"
              : "h-[260px] w-[560px]"
            : isSm
            ? "h-24 w-28"
            : "h-36 w-56"
        )}
      >
        <img src={coverUrl} alt="" className="h-full w-full object-cover" />
      </div>

      {variant === "chips" ? (
        <div className="min-w-0 self-center">
          <div className="mb-3 text-muted-text">
            <IconLocation className="h-5 w-5" />
          </div>
          <div className={cn("flex items-start", isSm ? "flex-row flex-wrap gap-2" : "flex-col gap-4")}>
            {tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        </div>
      ) : variant === "compact" ? (
        <>
          <div className="min-w-0 self-center">
            <div className="flex flex-row flex-wrap items-center gap-2">
              {tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </div>
          </div>
          <div className="justify-self-end self-start">
            <Rating value={rating} size={isSm ? "sm" : "md"} />
          </div>
        </>
      ) : (
        <div className="min-w-0 self-center">
          
          {!isSm && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {showAvatarComputed && (
                  <img src={avatarUrl || coverUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-[16px] font-semibold leading-6 text-ink">
                    {title}
                  </h3>
                  <p className="truncate text-[14px] leading-5 text-muted-text">
                    By {hostName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-muted-text">
                <IconLocation />
                <span className="truncate text-[14px] leading-5">{location}</span>
              </div>

              <div className="flex flex-row flex-wrap items-center gap-2">
                {tags.map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </div>
            </div>
          )}

          {isSm && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-[14px] font-semibold leading-5 text-ink">
                  {title}
                </h3>
                <div className="ml-2 flex-shrink-0">
                  <Rating value={rating} size="sm" />
                </div>
              </div>
              <p className="truncate text-[12px] leading-4 text-muted-text">
                By {hostName}
              </p>
              <div className="flex flex-row flex-wrap items-center gap-2">
                {tags.map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {variant !== "compact" && !isSm && (
        <div className={cn("justify-self-end", variant === "chips" ? "self-center" : "self-center")}>
          <Rating value={rating} size="md" />
        </div>
      )}
    </article>
  );
}

export const PetSitterCardLarge = (props: Omit<PetSitterCardProps, "size">) => <PetSitterCard size="lg" {...props} />;
export const PetSitterCardSmall = (props: Omit<PetSitterCardProps, "size">) => <PetSitterCard size="sm" {...props} />;

export default PetSitterCard;