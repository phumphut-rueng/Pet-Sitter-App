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

type AdminSidebarProps = {
  className?: string;
  sticky?: boolean;
  landingHref?: string;
};

const ADMIN_ITEMS: SidebarItem[] = [
  { id: "owner", label: "Pet Owner", href: "/admin/owner", icon: "/icons/ic-user.svg" },
  { id: "sitter", label: "Pet Sitter", href: "/admin/petsitter", icon: "/icons/ic-paw.svg" },
  { id: "report", label: "Report", href: "/admin/reports", icon: "/icons/ic-report.svg" },
];

function Icon({ src }: { src: string }) {
  return (
    <span
      className="inline-block w-5 h-5"
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
          flex items-center gap-3 rounded-xl px-3 py-3 text-sm2-medium
          transition-colors cursor-pointer
          ${isActive 
            ? "bg-gray-9 text-white" 
            : "text-gray-4 hover:bg-gray-9 hover:text-white"
          }
        `}
      >
        <Icon src={item.icon} />
        <span>{item.label}</span>
      </div>
    </Link>
  );
}

export default function AdminSidebar({
  className = "",
  sticky = true,
  landingHref = "/",
}: AdminSidebarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const isActive = (href: string) => {
    const path = router.pathname;
    return path === href || (href !== "/" && path.startsWith(href));
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
        flex min-h-screen h-auto w-[240px] shrink-0 flex-col
        bg-ink text-white border-r border-gray-9
        ${className}
      `}
    >
      {/* Logo */}
      <div className="px-5 pt-8 pb-6 border-b border-gray-9">
        <Link href={landingHref}>
          <Image
            src="/icons/admin-logo.svg"
            alt="Sitter Admin"
            width={131}
            height={40}
            priority
          />
        </Link>
        <div className="mt-2 text-xs2-medium italic text-gray-6">
          Admin Panel
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {ADMIN_ITEMS.map((item) => (
            <li key={item.id}>
              <NavItem item={item} isActive={isActive(item.href)} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-gray-9">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="
            flex w-full items-center gap-3 px-4 py-5
            text-sm2-medium text-gray-4
            hover:bg-gray-9 hover:text-white
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