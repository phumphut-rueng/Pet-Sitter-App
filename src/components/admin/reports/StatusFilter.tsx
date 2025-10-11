import * as React from "react";
import type { ReportStatusUI } from "@/types/admin/reports";

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

export default function StatusFilter({ value, onChange, className = "" }: Props) {
  return (
    <div className={className}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ReportStatusUI | "all")}
        className="w-[200px] h-[44px] px-4 
        rounded-xl 
        border border-gray-2 bg-white 
        text-sm2-medium text-ink 
        focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg 
        cursor-pointer transition-colors hover:border-gray-4"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}