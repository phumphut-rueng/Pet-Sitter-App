import { ReactNode } from "react";
import type { TabType } from "@/types/admin";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: Array<{ key: TabType; label: string }> = [
  { key: "profile", label: "Profile" },
  { key: "booking", label: "Booking" },
  { key: "reviews", label: "Reviews" },
  { key: "history", label: "History" },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div>
      <div className="flex gap-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-6 py-4 font-medium rounded-t-lg transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "text-brand bg-white border-l-4 border-brand"
                : "text-gray-6 bg-muted hover:bg-gray-2"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
