import * as React from "react";

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function PetSitterCardSkeleton({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "group grid cursor-pointer grid-cols-[224px_1fr] gap-4 rounded-2xl border border-border bg-white p-4 animate-pulse",
        className
      )}
    >
      {/* Image skeleton */}
      <div className="h-36 w-56 overflow-hidden rounded-xl bg-gray-200">
        <div className="h-full w-full bg-gray-300" />
      </div>
      
      {/* Content skeleton */}
      <div className="min-w-0 self-center space-y-3">
        {/* Title and rating row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* Avatar skeleton */}
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="min-w-0 flex-1">
              {/* Title skeleton */}
              <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
              {/* Host name skeleton */}
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
          {/* Rating skeleton */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
        
        {/* Location skeleton */}
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex flex-row flex-wrap items-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-16 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
    </article>
  );
}

export const PetSitterCardSkeletonLarge = (props: { className?: string }) => (
  <PetSitterCardSkeleton {...props} />
);

export default PetSitterCardSkeleton;
