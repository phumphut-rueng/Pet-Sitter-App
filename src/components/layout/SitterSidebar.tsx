import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

type SitterSidebarProps = {
  className?: string;
  sticky?: boolean;
};

const SITTER_ITEMS: SidebarItem[] = [
  { id: "profile",  label: "Pet Sitter Profile", href: "/sitter/profile",  icon: "/icons/ic-user.svg" },
  { id: "booking",  label: "Booking List",       href: "/sitter/booking",  icon: "/icons/ic-list.svg" },
  //{ id: "calendar", label: "Calendar",           href: "/sitter/calendar", icon: "/icons/ic-calendar.svg" },
  { id: "payout",   label: "Payout Option",      href: "/sitter/payout",   icon: "/icons/ic-creditcard.svg" },
];

function Icon({ src }: { src: string }) {
  return (
    <span
      className="inline-block h-5 w-5"
      style={{
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

function NavItem({ item, isActive }: { item: SidebarItem; isActive: boolean }) {
  return (
    <Link href={item.href} className="block">
      <div
        className={`
          flex items-center gap-3 rounded-xl px-3 py-3
          text-[16px] font-medium leading-[150%] tracking-[-0.02em]
          transition-colors cursor-pointer
          ${isActive
            ? "bg-orange-1 text-orange-5"
            : "text-gray-7 hover:bg-orange-1 hover:text-orange-5"}
        `}
      >
        <Icon src={item.icon} />
        <span>{item.label}</span>
        {/* จุดแดงถูกลบออกแล้ว */}
      </div>
    </Link>
  );
}

export default function SitterSidebar({
  className = "",
  sticky = true,
}: SitterSidebarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const isActive = (href: string) => {
    const path = router.pathname;
    return path === href || path.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={`
        ${sticky ? "sticky top-0" : ""}
        flex h-auto min-h-screen w-[240px] shrink-0 flex-col
        bg-bg text-text border-r border-border
        ${className}
      `}
    >
      {/* Logo */}
      <div className="border-b border-border px-5 pt-8 pb-6">
        <Link href="/">
          <Image
            src="/icons/sitter-logo-1.svg"
            alt="Sitter"
            width={131}
            height={40}
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {SITTER_ITEMS.map((item) => (
            <li key={item.id}>
              <NavItem item={item} isActive={isActive(item.href)} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-border">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="
            flex w-full items-center gap-3 px-4 py-5
            text-[16px] font-medium leading-[150%] tracking-[-0.02em]
            text-gray-7 hover:bg-orange-1 hover:text-orange-5
            transition-colors cursor-pointer
            disabled:opacity-50
          "
        >
          <Icon src="/icons/ic-logout.svg" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}