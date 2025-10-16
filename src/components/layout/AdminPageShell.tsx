import * as React from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";

type Props = {
  title?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function AdminPageShell({ title, header, children, className = "" }: Props) {
  return (
    <div className={`min-h-screen bg-gray-1 ${className}`}>
      <div className="container-1200">
        <div className="flex">
          {/* Sidebar (กว้าง 240 ตามดีไซน์) */}
          <aside className="w-[240px] shrink-0">
            <AdminSidebar />
          </aside>

          {/* Content */}
          <main className="flex-1 minw-0 p-6">
            {header ?? (title ? <h1 className="h2-bold text-ink mb-4">{title}</h1> : null)}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}