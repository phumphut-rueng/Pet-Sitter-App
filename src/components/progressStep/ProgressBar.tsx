import React from "react";
import { cn } from "@/lib/utils";

type StepStatus = "inactive" | "active" | "done";

interface ProgressBarProps {
    number: number;
    label: string;
    status?: StepStatus;
}

export default function ProgressBar({ number = 1, label, status = "inactive" }: ProgressBarProps) {
    return (
        <div className="flex items-center gap-2">
            {/* Circle number */}
            <div
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-medium",
                    status === "inactive" && "bg-gray-1 text-gray-4",
                    status === "active" && "bg-orange-5 text-white",
                    status === "done" && "bg-black text-orange-5"
                )}
            >
                {number}
            </div>

            {/* Label */}
            <span
                className={cn(
                    "font-medium",
                    status === "inactive" && "text-gray-4",
                    status === "active" && "text-orange-5",
                    status === "done" && "text-gray-6"
                )}
            >
                {label}
            </span>
        </div>
    );
}
