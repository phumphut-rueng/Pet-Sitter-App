import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type Item = {
  id: string;
  label: string;
  href?: string;
  iconSrc: string;
  notify?: boolean;
};

export type SidebarProps = {
  className?: string;
  activeId?: string;
  onNavigate?: (id: string) => void;
  logoSrc?: string; 
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function Sidebar({
  className = "",
  activeId,
  onNavigate,
  logoSrc = "/icons/sitter-logo-1.svg",
  
}: SidebarProps) {
  const pathname = usePathname();

  const items: Item[] = [
    { id: "profile",  label: "Pet Sitter Profile", href: "/sitter/profile",  iconSrc: "/icons/ic-user.svg" },
    { id: "booking",  label: "Booking List",       href: "/sitter/booking",  iconSrc: "/icons/ic-list.svg",     notify: true },
    { id: "calendar", label: "Calendar",           href: "/sitter/calendar", iconSrc: "/icons/ic-calendar.svg" },
    { id: "payout",   label: "Payout Option",      href: "/sitter/payout",   iconSrc: "/icons/ic-creditcard.svg" },
  ];

  
  const resolvedActiveId =
    activeId ??
    items.find((it) => it.href && pathname?.startsWith(it.href))?.id ??
    "profile";

  return (
    <aside
      className={cn(
        "flex h-screen w-[240px] shrink-0 flex-col bg-bg text-text border-r border-border",
        className
      )}
    >
     
      <div className="px-5 pt-8 pb-6 border-b border-border">
        <Image src={logoSrc} alt="Sitter" width={120} height={30} priority />
       
      </div>

   
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-0.5">
          {items.map((it) => {
            const isActive = resolvedActiveId === it.id;

            const Inner = (
              <div
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                  
                  isActive
                    ? "bg-orange-50 text-orange-6"
                    : "text-gray-7 hover:bg-orange-50 hover:text-orange-6",
              
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                )}
                onClick={() => onNavigate?.(it.id)}
                role="button"
                tabIndex={0}
              >
                {/* Icon */}
                <Image
                  src={it.iconSrc}
                  alt=""
                  width={20}
                  height={20}
                  className={cn(
                    "opacity-80 group-hover:opacity-100",
                    isActive && "opacity-100"
                  )}
                />
                <span className="text-[15px] font-medium leading-5">{it.label}</span>

                {it.notify && (
                  <span className="ml-auto mt-[1px] inline-block h-2 w-2 rounded-full bg-red" />
                )}
              </div>
            );

            return (
              <li key={it.id}>
                {it.href ? (
                  <Link href={it.href} className="block">
                    {Inner}
                  </Link>
                ) : (
                  Inner
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      
      <div className="mt-auto border-t border-border">
        <button
          className={cn(
            "flex w-full items-center gap-3 px-4 py-4 transition-colors",
            "text-gray-7 hover:bg-orange-50 hover:text-orange-6",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          )}
          onClick={() => onNavigate?.("logout")}
        >
          <Image
            src="/icons/ic-logout.svg"
            alt=""
            width={20}
            height={20}
            className="opacity-80"
          />
          <span className="text-[15px] font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
