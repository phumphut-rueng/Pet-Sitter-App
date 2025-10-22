import * as React from "react";
import type { ReportStatusUI } from "@/types/admin/reports";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/utils";
import { CheckIcon } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";

type Props = {
  value: ReportStatusUI | "all";
  onChange: (status: ReportStatusUI | "all") => void;
  className?: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "newReport", label: "New Report" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "canceled", label: "Canceled" },
] as const;

// Custom SelectContent
const CustomSelectContent: React.FC<{ children: React.ReactNode; position?: "popper" | "item-aligned" }> = ({ 
  children, 
  position = "popper" 
}) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] origin-[var(--radix-select-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md shadow-md !border-0 bg-white",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
      )}
      position={position}
    >
      <SelectPrimitive.Viewport className="p-1 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

// Custom SelectItem
const CustomSelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ 
  value, 
  children 
}) => (
  <SelectPrimitive.Item
    value={value}
    className={cn(
      "focus:bg-gray-4 focus:text-white hover:bg-gray-4 hover:text-white relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    )}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

export default function StatusFilter({ value, onChange, className = "" }: Props) {
  return (
    <div className={className}>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as ReportStatusUI | "all")}
      >
        <SelectTrigger className="w-[200px] !h-11 rounded-xl border border-gray-2 bg-white !px-4 text-sm2-medium text-ink focus:outline-none focus:border-orange-5">
          <SelectValue />
        </SelectTrigger>
        <CustomSelectContent>
          {STATUS_OPTIONS.map((option) => (
            <CustomSelectItem key={option.value} value={option.value}>
              {option.label}
            </CustomSelectItem>
          ))}
        </CustomSelectContent>
      </Select>
    </div>
  );
}