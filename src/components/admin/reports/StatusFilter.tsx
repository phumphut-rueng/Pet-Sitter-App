import * as React from "react";
import type { ReportStatusUI } from "@/types/admin/reports";
import { CustomSelect } from "@/components/dropdown/CustomSelect";

type Props = {
  value: ReportStatusUI | "all";
  onChange: (status: ReportStatusUI | "all") => void;
  className?: string;
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All status" },
  { value: "newReport", label: "New Report" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "canceled", label: "Canceled" },
];

export default function StatusFilter({ value, onChange, className = "" }: Props) {
  return (
    <div className={className}>
      <div className="[&_button]:!w-[240px] [&_button]:!h-12 [&_button]:!py-3 [&_button]:!pr-4 [&_button]:!pl-3 [&_button]:!gap-2 [&_button]:!rounded-lg [&_button]:!border [&_button]:!border-gray-2 [&_button]:!text-sm2-medium [&_button]:!text-gray-3 [&_button:focus]:!outline-none [&_button:focus]:!border-orange-5 [&_button:focus]:!ring-0">
        <CustomSelect
          value={value}
          onChange={(val) => onChange(val as ReportStatusUI | "all")}
          options={STATUS_OPTIONS}
          variant="filter"
          triggerSize=""
        />
      </div>
    </div>
  );
}