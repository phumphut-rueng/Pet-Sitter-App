import * as React from "react";
import OwnerTabs, { type OwnerTabValue } from "@/components/admin/owners/OwnerTabs";

type Props = {
  title: string;
  tab: OwnerTabValue;
  onTabChange: (v: OwnerTabValue) => void;
  className?: string;
};

export default function OwnerHeader({ title, tab, onTabChange, className }: Props) {
  return (
    <header className={className}>
      <h1 className="text-2xl font-semibold text-ink/90 mb-6">{title}</h1>
      <div className="px-10 pt-10">
        <OwnerTabs value={tab} onValueChange={onTabChange} />
      </div>
    </header>
  );
}