import * as React from "react";
import Image from "next/image";

type Size = "lg" | "sm";
type Variant = "default" | "chips" | "compact";
type SmPreset = "wide" | "compact";
type LgLayout = "side" | "cover";

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
  smPreset?: SmPreset;
  lgLayout?: LgLayout;
  className?: string;
};

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
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

function Rating({ value = 0, size = "md" }: { value?: number; size?: "xs" | "sm" | "md" }) {
  let starSize = "h-5 w-5";
  if (size === "xs") starSize = "h-3 w-3";
  if (size === "sm") starSize = "h-[14px] w-[14px]";

  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < Math.floor(value)) {
      stars.push(1);
    } else if (i === Math.floor(value) && value % 1 >= 0.5) {
      stars.push(0.5);
    } else {
      stars.push(0);
    }
  }

  return (
    <div className="flex items-center gap-1 text-success">
      {stars.map((star, i) => (
        <div key={i} className={starSize}>
          {star === 1 ? (
            <IconStar className={starSize} />
          ) : star === 0.5 ? (
            <div className="relative">
              <IconStar className={starSize} />
              <div className="absolute inset-y-0 right-0 w-1/2 bg-white" />
            </div>
          ) : (
            <div className="opacity-30">
              <IconStar className={starSize} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  let color = "bg-muted text-muted-text ring-border";
  
  if (label === "Dog") color = "bg-green-bg text-success ring-success";
  if (label === "Cat") color = "bg-pink-bg text-pink ring-pink";
  if (label === "Bird") color = "bg-blue-bg text-blue ring-blue";
  if (label === "Rabbit") color = "bg-orange-1 text-orange-4 ring-orange-4";

  return (
    <span className={cn(
      "inline-flex h-8 items-center rounded-full px-3 text-[14px] font-medium ring-1 ring-inset whitespace-nowrap shrink-0",
      color
    )}>
      {label}
    </span>
  );
}

export function PetSitterCard({
  size = "lg",
  title,
  hostName,
  location,
  rating = 5,
  tags,
  coverUrl,
  avatarUrl,
  showAvatar,
  className,
  smPreset = "wide",
  lgLayout = "side",
}: PetSitterCardProps) {
  const isSmall = size === "sm";
  const showAv = showAvatar !== undefined ? showAvatar : !isSmall;

  if (!isSmall && lgLayout === "cover") {
    return (
      <article
        tabIndex={0}
        className={cn(
          "group w-[335px] min-h-[268px] rounded-2xl border border-border bg-white p-4 cursor-pointer hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] focus-visible:outline-none",
          className
        )}
      >
        <div className="h-[100px] w-full overflow-hidden rounded-xl bg-muted">
          <Image src={coverUrl} alt="" className="h-full w-full object-cover" width={303} height={100} />
        </div>
        <div className="mt-3 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {showAv && (
                <Image src={avatarUrl || coverUrl} alt="" className="h-9 w-9 rounded-full object-cover" width={36} height={36} />
              )}
              <div className="min-w-0">
                <h3 className="truncate text-[20px] leading-7 font-semibold text-ink">{title}</h3>
                <p className="truncate text-[14px] leading-5 text-muted-text">By {hostName}</p>
              </div>
            </div>
            <div className="shrink-0 translate-y-[2px]">
              <Rating value={rating} size="xs" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-text">
            <IconLocation />
            <span className="truncate text-[14px] leading-5">{location}</span>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2">
            {tags.map((tag) => <Tag key={tag} label={tag} />)}
          </div>
        </div>
      </article>
    );
  }

  if (!isSmall) {
    return (
      <article
        tabIndex={0}
        className={cn(
          "group grid cursor-pointer grid-cols-[224px_1fr] gap-4 rounded-2xl border border-border bg-white p-4 hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] focus-visible:outline-none",
          className
        )}
      >
        <div className="h-36 w-56 overflow-hidden rounded-xl bg-muted">
          <Image src={coverUrl} alt="" className="h-full w-full object-cover" width={224} height={144} />
        </div>
        <div className="min-w-0 self-center space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {showAv && (
                <Image src={avatarUrl || coverUrl} alt="" className="h-10 w-10 rounded-full object-cover" width={40} height={40} />
              )}
              <div className="min-w-0">
                <h3 className="truncate text-[24px] leading-8 font-semibold text-ink">{title}</h3>
                <p className="truncate text-[14px] leading-5 text-muted-text">By {hostName}</p>
              </div>
            </div>
            <div className="shrink-0 translate-y-[2px]">
              <Rating value={rating} size="md" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-text">
            <IconLocation />
            <span className="truncate text-[14px] leading-5">{location}</span>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2">
            {tags.map((tag) => <Tag key={tag} label={tag} />)}
          </div>
        </div>
      </article>
    );
  }

  if (smPreset === "wide") {
    return (
      <article
        tabIndex={0}
        className={cn(
          "group grid w-[471px] h-[138px] cursor-pointer grid-cols-[144px_1fr] gap-4 rounded-2xl border border-border bg-white p-4 hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] focus-visible:outline-none",
          className
        )}
      >
        <div className="h-[108px] w-[144px] overflow-hidden rounded-xl bg-muted">
          <Image src={coverUrl} alt="" className="h-full w-full object-cover" width={144} height={108} />
        </div>
        <div className="min-w-0 grid grid-rows-[auto_auto_1fr] items-start">
          <div className="min-w-0">
            <h3 className="truncate text-[20px] leading-7 font-semibold text-ink">{title}</h3>
            <p className="truncate text-[14px] leading-5 text-muted-text">By {hostName}</p>
          </div>
          <div className="mt-1">
            <Rating value={rating} size="sm" />
          </div>
          <div className="mt-2 flex flex-row flex-wrap items-center gap-2">
            {tags.map((tag) => <Tag key={tag} label={tag} />)}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      tabIndex={0}
      className={cn(
        "group grid w-[330px] h-[146px] cursor-pointer grid-cols-[97px_1fr] grid-rows-[auto_1fr] gap-x-4 gap-y-2 rounded-2xl border border-border bg-white p-3 hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)] focus-visible:outline-none",
        className
      )}
    >
      <div className="h-[73px] w-[97px] overflow-hidden rounded-xl bg-muted">
        <Image src={coverUrl} alt="" className="h-full w-full object-cover" width={97} height={73} />
      </div>
      <div className="min-w-0 self-start">
        <h3 className="truncate text-[20px] leading-7 font-semibold text-ink">{title}</h3>
        <p className="truncate text-[14px] leading-5 text-muted-text">By {hostName}</p>
        <div className="mt-1">
          <Rating value={rating} size="sm" />
        </div>
      </div>
      <div className="col-span-2 row-start-2 mt-1 flex flex-row flex-wrap items-center gap-2">
        {tags.map((tag) => <Tag key={tag} label={tag} />)}
      </div>
    </article>
  );
}

export const PetSitterCardLarge = (props: Omit<PetSitterCardProps, "size">) => (
  <PetSitterCard size="lg" {...props} />
);
export const PetSitterCardSmall = (props: Omit<PetSitterCardProps, "size">) => (
  <PetSitterCard size="sm" {...props} />
);

export default PetSitterCard;