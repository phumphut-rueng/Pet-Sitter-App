import React from "react";
import { cn } from "@/lib/utils/utils";

type StepStatus = "inactive" | "active" | "done";

interface ProgressBarProps {
    number?: number;
    label: string;
    size?: number;
    status?: StepStatus;
}

export default function ProgressBar({
    number = 1,
    label,
    size = 48,
    status = "inactive"
}: ProgressBarProps) {
    // fontSize สำหรับวงกลม
    let circleFontSize = 14; // default
    if (size >= 48) circleFontSize = 24;
    else if (size <= 12) circleFontSize = 18;

    // fontSize สำหรับ Label
    let labelFontSize = 14; // default
    if (size >= 48) labelFontSize = 18;
    else if (size <= 12) labelFontSize = 14;

    return (
        <div className="flex items-center gap-2">
            {/* Circle number */}
            <div
                style={{ width: size, height: size, fontSize: circleFontSize }}
                className={cn(
                    "rounded-full flex items-center justify-center font-medium",
                    status === "inactive" && "bg-gray-1 text-gray-6",
                    status === "active" && "bg-orange-5 text-white",
                    status === "done" && "bg-black text-orange-5"
                )}
            >
                {number}
            </div>

            {/* Label */}
            <span
                style={{ fontSize: labelFontSize }}
                className={cn(
                    status === "inactive" && "text-gray-6",
                    status === "active" && "text-orange-5",
                    status === "done" && "text-gray-9"
                )}
            >
                {label}
            </span>
        </div>
    );
}
