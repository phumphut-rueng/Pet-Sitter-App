import * as React from "react";
import { useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";
import OwnerTabs, { type OwnerTabValue } from "@/components/admin/owners/OwnerTabs";

type Props = {
  title: string;
  tab: OwnerTabValue;
  onTabChange: (v: OwnerTabValue) => void;
  className?: string;
  showBack?: boolean;
};

export default function OwnerHeader({
  title,
  tab,
  onTabChange,
  className,
  showBack = true,
}: Props) {
  const router = useRouter();

  return (
    <header className={className}>
      {/* แถวบน: ลูกศร + ชื่อ (บรรทัดเดียว) */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 minw-0">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-ink hover:bg-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          {/* ชื่อชิดกับลูกศร ในบรรทัดเดียว และตัด ... ถ้ายาว */}
          <h1 className="h3-bold  text-ink">{title}</h1>
        </div>
      </div>

      {/* แท็บ */}
      <div className="px-10 pt-8">
        <OwnerTabs value={tab} onValueChange={onTabChange} />
      </div>
    </header>
  );
}