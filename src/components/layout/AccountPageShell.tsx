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
  header,                 
  children,
  showMobileTabs = true,
  showTitle = false,         //  DEFAULT: ไม่แสดงหัวข้อ
  className = "",
  titleClassName = "hidden md:block text-2xl font-bold mb-4",
}: {
  title?: string;
  header?: React.ReactNode;  //  ถ้าส่งมาจะเรนเดอร์แทน h1
  children: React.ReactNode;
  showMobileTabs?: boolean;
  showTitle?: boolean;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={`min-h-screen bg-gray-1 ${className}`}>
      <div className="container mx-auto max-w-[1200px] px-4 lg:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block md:w-[292px] flex-shrink-0">
            <AccountSidebarMini />
          </aside>

          {/* Main content */}
          <section className="flex-1 min-w-0">
            {/* Mobile Tabs */}
            {showMobileTabs && <AccountTabs className="-mx-4 lg:-mx-1 mb-4" />}

            {/* Header / Title */}
            {showTitle && (header ?? (title ? <h1 className={titleClassName}>{title}</h1> : null))}

            {children}
          </section>
        </div>
      </div>
    </div>
  );
}