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
      <h1 className="text-xl md:text-2xl font-semibold text-ink/90">{title}</h1>
      {children}
    </div>
  );
}