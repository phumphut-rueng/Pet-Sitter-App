import { useState } from "react";
import type { TabType } from "@/types/admin";

export function useTabNavigation(
  initialTab: TabType = "profile",
  onTabChange?: (tab: TabType) => void
) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return {
    activeTab,
    handleTabChange,
  };
}
