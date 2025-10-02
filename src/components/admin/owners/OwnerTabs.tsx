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
              "px-8 py-4 text-base font-medium",
              "transition-all duration-200",
              index === 0 
                ? "rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-none" // Tab แรก: โค้ง 3 มุม
                : "rounded-t-xl", // Tab อื่นๆ: โค้งแค่ด้านบน
              "data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm",
              "data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-500",
              "hover:bg-orange-100 hover:text-orange-600",
              "data-[state=active]:hover:bg-orange-600"
            )}
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}