import React from "react";
import AccountSidebarMini from "@/components/layout/AccountSidebarMini";
import AccountTabs from "@/components/features/account/AccountTabs";

/**
 * AccountPageShell
 * เดสก์ท็อป: Sidebar
 * มือถือ: Tabs (AccountTabs)
 */
export default function AccountPageShell({
  title,
  children,
  showMobileTabs = true,
}: {
  title: string;
  children: React.ReactNode;
  showMobileTabs?: boolean;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-[1200px] px-4 lg:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-8">
          <aside className="hidden md:block md:w-[292px] flex-shrink-0">
            <AccountSidebarMini />
          </aside>

          <section className="flex-1 min-w-0">
            {showMobileTabs && <AccountTabs className="-mx-4 lg:-mx-1 mb-4" />}
            <h1 className="hidden md:block text-2xl font-bold mb-4">{title}</h1>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}