import { cn } from "@/lib/utils/utils";
import React from "react";

export default function PageHeader({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-5 flex items-center justify-between gap-4", className)}>
      <h1 className="h4-bold md:h3-bold text-ink">{title}</h1>
      {children}
    </div>
  );
}