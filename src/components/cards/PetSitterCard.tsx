import * as React from "react";
import Image from "next/image";

export type CardSize = "lg" | "sm";
export type CardVariant = "default" | "chips" | "compact";
export type SmallPreset = "wide" | "compact";
export type LargeLayout = "side" | "cover";

export type PetSitterCardProps = {
  size?: CardSize;
  variant?: CardVariant;
  title: string;
  hostName: string;
  location: string;
  rating?: number;
  tags: string[];
  coverUrl: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  smPreset?: SmallPreset;
  lgLayout?: LargeLayout;
  className?: string;
};

const TAG_COLORS = {
  Dog: "bg-green-bg text-success ring-success",
  Cat: "bg-pink-bg text-pink ring-pink",
  Bird: "bg-blue-bg text-blue ring-blue",
  Rabbit: "bg-orange-1 text-orange-4 ring-orange-4",
  default: "bg-muted text-muted-text ring-border",
} as const;

const RATING_SIZES = {
  xs: "h-3 w-3",
  sm: "h-[14px] w-[14px]",
  md: "h-5 w-5",
} as const;

// ✅ map ขนาดตัวเลขไว้ใช้กับ <Image width/height>
const AVATAR_DIM = { sm: 36, md: 40, lg: 64 } as const;

const CARD_STYLES = {
  base: `
    group cursor-pointer rounded-2xl border border-border bg-white
    hover:shadow-[0_6px_24px_rgba(50,54,64,0.08)]
    focus-visible:outline-none
  `,
  tag: `
    inline-flex h-8 items-center rounded-full px-3 text-[14px]
    font-medium ring-1 ring-inset whitespace-nowrap shrink-0
  `,
  title: {
    lg: "text-[24px] leading-8 font-semibold text-ink",
    md: "text-[20px] leading-7 font-semibold text-ink",
  },
  subtitle: "text-[14px] leading-[22px] text-muted-text",    
  location: "flex items-center gap-2 text-muted-text",      
  locationText: "truncate text-[14px] leading-[22px]",        
  tagContainer: "flex flex-row flex-wrap items-center gap-x-2 gap-y-2.5",
  avatar: {
    sm: "h-9 w-9 rounded-full object-cover",    
    md: "h-10 w-10 rounded-full object-cover",  
    lg: "h-16 w-16 rounded-full object-cover",  
  },
  image: "h-full w-full object-cover",
  imageContainer: "overflow-hidden rounded-xl bg-muted",
} as const;

const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

const getTagColor = (tag: string): string =>
  TAG_COLORS[tag as keyof typeof TAG_COLORS] ?? TAG_COLORS.default;


export const LocationIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
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

export const StarRating: React.FC<{ value: number; size: keyof typeof RATING_SIZES }> = React.memo(
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

const CardHeader: React.FC<{
  title: string;
  hostName: string;
  rating: number;
  avatarUrl?: string;
  coverUrl: string;
  showAvatar: boolean;
  titleSize: "lg" | "md";
  avatarSize: "sm" | "md" | "lg"; 
  ratingSize: keyof typeof RATING_SIZES;
}> = React.memo(
  ({ title, hostName, rating, avatarUrl, coverUrl, showAvatar, titleSize, avatarSize, ratingSize }) => (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {showAvatar && (
          <Image
            src={avatarUrl || coverUrl}
            alt=""
            className={CARD_STYLES.avatar[avatarSize]}
            width={AVATAR_DIM[avatarSize]}
            height={AVATAR_DIM[avatarSize]}
          />
        )}
        <div className="min-w-0">
          <h3 className={cn("truncate", CARD_STYLES.title[titleSize])}>{title}</h3>
          <p className={cn("truncate", CARD_STYLES.subtitle)}>By {hostName}</p>
        </div>
      </div>
      <div className="shrink-0 translate-y-[2px]">
        <StarRating value={rating} size={ratingSize} />
      </div>
    </div>
  )
);
CardHeader.displayName = "CardHeader";

const LocationInfo: React.FC<{ location: string }> = React.memo(({ location }) => (
  <div className={CARD_STYLES.location}>
    <LocationIcon />
    <span className={CARD_STYLES.locationText}>{location}</span>
  </div>
));
LocationInfo.displayName = "LocationInfo";

export const TagList: React.FC<{ tags: string[] }> = React.memo(({ tags }) => (
  <div className={CARD_STYLES.tagContainer}>
    {tags.map((tag) => (
      <TagChip key={tag} label={tag} />
    ))}
  </div>
));
TagList.displayName = "TagList";

const CoverImage: React.FC<{ src: string; alt: string; width: number; height: number; className?: string }> =
  React.memo(({ src, alt, width, height, className }) => (
    <div className={cn(CARD_STYLES.imageContainer, className)}>
      <Image src={src} alt={alt} className={CARD_STYLES.image} width={width} height={height} />
    </div>
  ));
CoverImage.displayName = "CoverImage";

const LargeCoverLayout: React.FC<{
  title: string;
  hostName: string;
  location: string;
  rating: number;
  tags: string[];
  coverUrl: string;
  avatarUrl?: string;
  showAvatar: boolean;
  className?: string;
}> = React.memo((props) => (
  <article tabIndex={0} className={cn(CARD_STYLES.base, "w-[335px] min-h-[320px] p-4", props.className)}>
    <CoverImage src={props.coverUrl} alt="" width={303} height={160} className="h-[160px] w-full" />
    <div className="mt-3 space-y-3">
      <CardHeader
        title={props.title}
        hostName={props.hostName}
        rating={props.rating}
        avatarUrl={props.avatarUrl}
        coverUrl={props.coverUrl}
        showAvatar={props.showAvatar}
        titleSize="md"
        avatarSize="sm"     // mobile/cover ใช้เล็ก
        ratingSize="xs"
      />
      <LocationInfo location={props.location} />
      <TagList tags={props.tags} />
    </div>
  </article>
));
LargeCoverLayout.displayName = "LargeCoverLayout";

const LargeSideLayout: React.FC<{
  title: string;
  hostName: string;
  location: string;
  rating: number;
  tags: string[];
  coverUrl: string;
  avatarUrl?: string;
  showAvatar: boolean;
  className?: string;
}> = React.memo((props) => (
  <article
    tabIndex={0}
    className={cn(CARD_STYLES.base, "grid grid-cols-[280px_1fr] items-start gap-5 p-5", props.className)}
  >
    <CoverImage src={props.coverUrl} alt="" width={280} height={200} className="h-[200px] w-[280px]" />
    <div className="min-w-0 self-start grid grid-rows-[auto_auto_auto] gap-y-3.5">
      <CardHeader
        title={props.title}
        hostName={props.hostName}
        rating={props.rating}
        avatarUrl={props.avatarUrl}
        coverUrl={props.coverUrl}
        showAvatar={props.showAvatar}
        titleSize="lg"
        avatarSize="lg"   
        ratingSize="md"
      />
    <div className="mt-0.5">
     <LocationInfo location={props.location} />
   </div>
     <div className="mt-1">
       <TagList tags={props.tags} />
   </div>
    </div>
  </article>
));
LargeSideLayout.displayName = "LargeSideLayout";

const SmallWideLayout: React.FC<{
  title: string;
  hostName: string;
  rating: number;
  tags: string[];
  coverUrl: string;
  className?: string;
}> = React.memo((props) => (
  <article tabIndex={0} className={cn(CARD_STYLES.base, "grid h-[138px] w-[471px] grid-cols-[144px_1fr] gap-4 p-4", props.className)}>
    <CoverImage src={props.coverUrl} alt="" width={144} height={108} className="h-[108px] w-[144px]" />
    <div className="min-w-0 grid grid-rows-[auto_auto_1fr] items-start">
      <div className="min-w-0">
        <h3 className={cn("truncate", CARD_STYLES.title.md)}>{props.title}</h3>
        <p className={cn("truncate", CARD_STYLES.subtitle)}>By {props.hostName}</p>
      </div>
      <div className="mt-1">
        <StarRating value={props.rating} size="sm" />
      </div>
      <div className="mt-2">
        <TagList tags={props.tags} />
      </div>
    </div>
  </article>
));
SmallWideLayout.displayName = "SmallWideLayout";

const SmallCompactLayout: React.FC<{
  title: string;
  hostName: string;
  rating: number;
  tags: string[];
  coverUrl: string;
  className?: string;
}> = React.memo((props) => (
  <article
    tabIndex={0}
    className={cn(
      CARD_STYLES.base,
      "grid h-[146px] w-[330px] grid-cols-[97px_1fr] grid-rows-[auto_1fr] gap-x-4 gap-y-2 p-3",
      props.className
    )}
  >
    <CoverImage src={props.coverUrl} alt="" width={97} height={73} className="h-[73px] w-[97px]" />
    <div className="min-w-0 self-start">
      <h3 className={cn("truncate", CARD_STYLES.title.md)}>{props.title}</h3>
      <p className={cn("truncate", CARD_STYLES.subtitle)}>By {props.hostName}</p>
      <div className="mt-1">
        <StarRating value={props.rating} size="sm" />
      </div>
    </div>
    <div className="col-span-2 row-start-2 mt-1">
      <TagList tags={props.tags} />
    </div>
  </article>
));
SmallCompactLayout.displayName = "SmallCompactLayout";

// ===== Main Component
const PetSitterCardBase: React.FC<PetSitterCardProps> = ({
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
}) => {
  const isSmall = size === "sm";
  const shouldShowAvatar = showAvatar !== undefined ? showAvatar : !isSmall;

  if (!isSmall) {
    //  ใช้ lgLayout จริง เพื่อเลือก layout
    return lgLayout === "side" ? (
      <LargeSideLayout
        title={title}
        hostName={hostName}
        location={location}
        rating={rating}
        tags={tags}
        coverUrl={coverUrl}
        avatarUrl={avatarUrl}
        showAvatar={shouldShowAvatar}
        className={className}
      />
    ) : (
      <LargeCoverLayout
        title={title}
        hostName={hostName}
        location={location}
        rating={rating}
        tags={tags}
        coverUrl={coverUrl}
        avatarUrl={avatarUrl}
        showAvatar={shouldShowAvatar}
        className={className}
      />
    );
  }

  // Small
  const smallCommon = { title, hostName, rating, tags, coverUrl, className };
  return smPreset === "wide" ? <SmallWideLayout {...smallCommon} /> : <SmallCompactLayout {...smallCommon} />;
};

export const PetSitterCard = React.memo(PetSitterCardBase);
export const PetSitterCardLarge = (props: Omit<PetSitterCardProps, "size">) => <PetSitterCard size="lg" {...props} />;
export const PetSitterCardSmall = (props: Omit<PetSitterCardProps, "size">) => <PetSitterCard size="sm" {...props} />;

export default PetSitterCard;