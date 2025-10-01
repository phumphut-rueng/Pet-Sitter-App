import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type SidebarItem = {
  id: string;
  label: string;
  href: string;
  iconSrc: string;
  notify?: boolean;
};

export type AdminSidebarProps = {
  className?: string;
  onNavigate?: (id: string) => void;
  onLogout?: () => Promise<void> | void;
  logoSrc?: string;
  sticky?: boolean;
};

const CONFIG = {
  width: 240,
  logoWidth: 131,
  logoHeight: 40,
  defaultLogoSrc: "/icons/admin-logo.svg",
} as const;

const ADMIN_ITEMS: readonly SidebarItem[] = [
  { id: "owner",   label: "Pet Owner", href: "/admin/owner",  iconSrc: "/icons/ic-user.svg" },
  { id: "sitter", label: "Pet Sitter", href: "/admin/petsitter",  iconSrc: "/icons/ic-paw.svg" },
  { id: "report", label: "Report",     href: "/admin/reports",    iconSrc: "/icons/ic-report.svg" },
] as const;

const LOGOUT = { id: "logout", label: "Log Out", iconSrc: "/icons/ic-logout.svg" } as const;

/** ---------- helpers ---------- */
const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(href));

/** ---------- small atoms ---------- */
const IconMask: React.FC<{ src: string; className?: string }> = React.memo(
  ({ src, className = "w-5 h-5" }) => (
    <span
      aria-hidden
      className={cn("inline-block align-middle", className)}
      style={{
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        display: "inline-block",
      }}
    />
  )
);
IconMask.displayName = "IconMask";

const NotificationBadge: React.FC = React.memo(() => (
  <span className="ml-auto mt-[1px] inline-block h-2 w-2 rounded-full bg-red-500" />
));
NotificationBadge.displayName = "NotificationBadge";

/** ---------- main ---------- */
export default function AdminSidebar({
  className = "",
  onNavigate,
  onLogout,
  logoSrc = CONFIG.defaultLogoSrc,
  sticky = true,
}: AdminSidebarProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const doDefaultLogout = React.useCallback(async () => {
    setPending(true);
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch {
      router.push("/");
    } finally {
      setPending(false);
    }
  }, [router]);

  const handleLogout = React.useCallback(() => {
    if (onLogout) return void onLogout();
    return void doDefaultLogout();
  }, [onLogout, doDefaultLogout]);

  const handleNavigate = React.useCallback(
    (id: string) => onNavigate?.(id),
    [onNavigate]
  );

  const positionCls = sticky ? "sticky top-0" : "static";

  return (
    <aside
      className={cn(
        positionCls,
        "flex min-h-[100svh] h-auto shrink-0 flex-col",
        "bg-black text-gray-200 border-r border-neutral-800",
        className
      )}
      style={{ width: CONFIG.width }}
    >
      {/* header / logo */}
      <div className="px-5 pt-8 pb-6 border-b border-neutral-800">
        <Link href="/admin" aria-label="Go to admin home" className="inline-flex items-center gap-2">
          <Image
            src={logoSrc}
            alt="Sitter Admin"
            width={CONFIG.logoWidth}
            height={CONFIG.logoHeight}
            priority
            style={{ width: CONFIG.logoWidth, height: "auto" }}
          />
          <span className="sr-only">Admin Panel</span>
        </Link>
        <div className="mt-2 italic font-medium leading-4 text-[16px] text-[#7B7E8F]">Admin Panel</div>
      </div>

      {/* nav list */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-0.5">
          {ADMIN_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const base =
              "group flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer";
            const activeCls = "bg-neutral-800 text-white";
            const inactiveCls = "text-gray-300 hover:bg-neutral-800 hover:text-white";
            return (
              <li key={item.id}>
                <Link href={item.href} className="block" onClick={() => handleNavigate(item.id)}>
                  <div className={cn(base, active ? activeCls : inactiveCls)}>
                    <IconMask src={item.iconSrc} />
                    <span className="text-[15px] font-medium leading-5">{item.label}</span>
                    {item.notify && <NotificationBadge />}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* logout */}
      <div className="mt-auto border-t border-neutral-800">
        <button
          className={cn(
            "flex w-full items-center gap-3 px-4 py-5 md:py-6",
            "text-gray-300 hover:bg-neutral-800 hover:text-white",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer"
          )}
          onClick={handleLogout}
          disabled={pending}
        >
          <IconMask src={LOGOUT.iconSrc} />
          <span className="text-[15px] font-medium leading-5">{LOGOUT.label}</span>
        </button>
      </div>
    </aside>
  );
}