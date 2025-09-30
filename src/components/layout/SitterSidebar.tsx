import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type SidebarItem = {
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
  onLogout?: () => Promise<void> | void;
  logoSrc?: string;
};

const SIDEBAR_CONFIG = {
  width: 240,
  logoWidth: 120,
  logoHeight: 30,
  defaultLogoSrc: "/icons/sitter-logo-1.svg",
  defaultActiveId: "profile",
} as const;

const NAVIGATION_ITEMS: readonly SidebarItem[] = [
  { id: "profile", label: "Pet Sitter Profile", href: "/sitter/profile", iconSrc: "/icons/ic-user.svg" },
  { id: "booking", label: "Booking List", href: "/sitter/booking", iconSrc: "/icons/ic-list.svg", notify: true },
  { id: "calendar", label: "Calendar", href: "/sitter/calendar", iconSrc: "/icons/ic-calendar.svg" },
  { id: "payout", label: "Payout Option", href: "/sitter/payout", iconSrc: "/icons/ic-creditcard.svg" },
] as const;

const LOGOUT_CONFIG = {
  id: "logout",
  label: "Log Out",
  iconSrc: "/icons/ic-logout.svg",
} as const;

const STYLES = {
  sidebar:
    "sticky top-0 flex min-h-[100svh] h-auto shrink-0 flex-col bg-bg text-text border-r border-border",
  header: "px-5 pt-8 pb-6 border-b border-border",
  nav: "flex-1 overflow-y-auto px-2 py-4",
  navList: "space-y-0.5",
  menuItem: {
    base: "group flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer",
    active: "bg-orange-50 text-orange-6",
    inactive: "text-gray-7 hover:bg-orange-50 hover:text-orange-6",
  },
  logout: {
    container: "mt-auto border-t border-border",
    button:
      "flex w-full items-center gap-3 px-4 py-5 md:py-6 transition-colors text-gray-7 hover:bg-orange-50 hover:text-orange-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer",
  },
  text: "text-[15px] font-medium leading-5",
  notification: "ml-auto mt-[1px] inline-block h-2 w-2 rounded-full bg-red",
} as const;

const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const findActiveItem = (pathname: string): string => {
  const matched = NAVIGATION_ITEMS.find((it) => it.href && pathname.startsWith(it.href));
  return matched ? matched.id : SIDEBAR_CONFIG.defaultActiveId;
};

const getMenuItemClassName = (isActive: boolean) =>
  cn(STYLES.menuItem.base, isActive ? STYLES.menuItem.active : STYLES.menuItem.inactive);

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

const SidebarLogo: React.FC<{ logoSrc: string }> = React.memo(({ logoSrc }) => (
  <div className={STYLES.header}>
    <Image
      src={logoSrc}
      alt="Sitter"
      width={SIDEBAR_CONFIG.logoWidth}
      height={SIDEBAR_CONFIG.logoHeight}
      priority
      className={`h-auto w-[${SIDEBAR_CONFIG.logoWidth}px]`}
    />
  </div>
));
SidebarLogo.displayName = "SidebarLogo";

const NotificationBadge: React.FC = React.memo(() => <span className={STYLES.notification} />);
NotificationBadge.displayName = "NotificationBadge";

const MenuItem: React.FC<{
  item: SidebarItem;
  isActive: boolean;
  onNavigate?: (id: string) => void;
}> = React.memo(({ item, isActive, onNavigate }) => {
  const handleClick = React.useCallback(() => onNavigate?.(item.id), [item.id, onNavigate]);
  return (
    <li>
      <Link href={item.href || "#"} className="block">
        <div className={getMenuItemClassName(isActive)} onClick={handleClick}>
          <IconMask src={item.iconSrc} />
          <span className={STYLES.text}>{item.label}</span>
          {item.notify && <NotificationBadge />}
        </div>
      </Link>
    </li>
  );
});
MenuItem.displayName = "MenuItem";

const NavigationList: React.FC<{
  currentActiveId: string;
  onNavigate?: (id: string) => void;
}> = React.memo(({ currentActiveId, onNavigate }) => (
  <nav className={STYLES.nav}>
    <ul className={STYLES.navList}>
      {NAVIGATION_ITEMS.map((item) => (
        <MenuItem key={item.id} item={item} isActive={currentActiveId === item.id} onNavigate={onNavigate} />
      ))}
    </ul>
  </nav>
));
NavigationList.displayName = "NavigationList";

const LogoutSection: React.FC<{ onClick: () => void; disabled?: boolean }> = React.memo(
  ({ onClick, disabled }) => (
    <div className={STYLES.logout.container}>
      <button className={STYLES.logout.button} onClick={onClick} disabled={disabled}>
        <IconMask src={LOGOUT_CONFIG.iconSrc} />
        <span className={STYLES.text}>{LOGOUT_CONFIG.label}</span>
      </button>
    </div>
  )
);
LogoutSection.displayName = "LogoutSection";

export default function Sidebar({
  className = "",
  activeId,
  onNavigate,
  onLogout,
  logoSrc = SIDEBAR_CONFIG.defaultLogoSrc,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const currentActiveId = React.useMemo(
    () => activeId || findActiveItem(pathname || ""),
    [activeId, pathname]
  );

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

  const sidebarClassName = cn(STYLES.sidebar, `w-[${SIDEBAR_CONFIG.width}px]`, className);

  return (
    <aside className={sidebarClassName}>
      <SidebarLogo logoSrc={logoSrc} />
      <NavigationList currentActiveId={currentActiveId} onNavigate={onNavigate} />
      <LogoutSection onClick={handleLogout} disabled={pending} />
    </aside>
  );
}