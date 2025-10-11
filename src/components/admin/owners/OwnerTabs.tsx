import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/utils";

export type OwnerTabValue = "profile" | "pets" | "reviews";

type Props = {
  value: OwnerTabValue;
  onValueChange: (v: OwnerTabValue) => void;
  className?: string;
};

export default function OwnerTabs({ value, onValueChange, className }: Props) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as OwnerTabValue)}
      className={className}
    >
      <TabsList
        className={cn(
          "h-auto bg-transparent p-0 gap-3",
          "flex items-center justify-start",
          "w-full"
        )}
      >
        {([
          ["profile", "Profile"],
          ["pets", "Pets"],
          ["reviews", "Reviews"],
        ] as const).map(([val, label], index) => (
          <TabsTrigger
            key={val}
            value={val}
            className={cn(
              "px-8 py-4 text-base-medium",
              "transition-all duration-200",
              "relative z-10",
              "focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg",
              index === 0 
                ? "rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-none"
                : "rounded-t-xl",
              // Active state
              "data-[state=active]:bg-white data-[state=active]:text-orange-5",
              "data-[state=active]:-mb-px",
              // Inactive state
              "data-[state=inactive]:bg-gray-2 data-[state=inactive]:text-gray-6",
              // Hover states
              "data-[state=inactive]:hover:bg-gray-1 data-[state=inactive]:hover:text-gray-7",
              "data-[state=active]:hover:text-orange-6"
            )}
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}