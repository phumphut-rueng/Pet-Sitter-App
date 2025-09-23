import React from "react";
import AccountSidebarMini from "@/components/layout/AccountSidebarMini";

export default function AccountPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-[1200px] px-4 lg:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-8">
          <aside className="md:w-[292px] flex-shrink-0">
            <AccountSidebarMini />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-8 pb-10">
              <h1 className="text-h3 font-semibold mb-6 text-slate-900">
                {title}
              </h1>
              <div className="mx-auto w-full max-w-[764px] min-w-0">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}