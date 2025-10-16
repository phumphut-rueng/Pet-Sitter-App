import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabConfig = {
  href: string;
  label: string;
  value: string;
  icon: (active: boolean) => React.ReactElement;
};
type Props = { className?: string };

const ICON_SIZE = 24;
const SVG_STYLE: React.CSSProperties = { display: "block" };

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" style={SVG_STYLE}>
    <circle cx={12} cy={8} r={3.25} fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
    <path d="M4.8 19c1.8-3 12.6-3 14.4 0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
  </svg>
);

const PawIcon = ({ active }: { active: boolean }) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" style={SVG_STYLE}>
    <circle cx={7.5} cy={8.5} r={2} fill="currentColor" />
    <circle cx={12} cy={6.5} r={2} fill="currentColor" />
    <circle cx={16.5} cy={8.5} r={2} fill="currentColor" />
    <path d="M8 15.5c0-1.9 1.6-3.5 4-3.5s4 1.6 4 3.5c0 2.1-1.8 3.3-4 3.3s-4-1.2-4-3.3z" fill="currentColor" />
    {active ? <circle cx={12} cy={15.5} r={0.9} fill="currentColor" /> : null}
  </svg>
);

const ListIcon = ({ active }: { active: boolean }) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" style={SVG_STYLE}>
    <rect x={6} y={6.5}  width={12} height={1.8} rx={0.9} fill="currentColor" />
    <rect x={6} y={11.1} width={12} height={1.8} rx={0.9} fill="currentColor" />
    <rect x={6} y={15.7} width={12} height={1.8} rx={0.9} fill="currentColor" />
    <circle cx={4.2} cy={7.4}  r={0.9} fill="currentColor" />
    <circle cx={4.2} cy={12}   r={0.9} fill="currentColor" />
    <circle cx={4.2} cy={16.6} r={0.9} fill="currentColor" />
    {active ? <rect x={5} y={5.7} width={14} height={0.8} fill="currentColor" /> : null}
  </svg>
);

const TABS: TabConfig[] = [
  { href: "/account/profile",  label: "Profile",         value: "profile",  icon: (active) => <ProfileIcon active={active} /> },
  { href: "/account/pet",      label: "Your Pet",        value: "pet",      icon: (active) => <PawIcon active={active} /> },
  { href: "/account/bookings", label: "Booking History", value: "bookings", icon: (active) => <ListIcon active={active} /> },
];

const styles = {
  wrap: "w-full md:hidden",
  list: "w-full h-14 bg-bg border-b border-border/20 rounded-none justify-start overflow-x-auto p-0",
  triggerBase: "flex-shrink-0 h-full flex items-center gap-2.5 px-6 text-base-bold rounded-none transition-colors hover:bg-transparent focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg",
  triggerActive: "data-[state=active]:text-orange-5 data-[state=active]:bg-orange-1",
};

function findCurrent(pathname: string): string {
  const match = TABS.find(t => pathname.startsWith(t.href));
  return match?.value ?? TABS[0].value;
}

export default function AccountTabsShadcn({ className = "" }: Props) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const current = findCurrent(pathname);

  const onChange = (value: string) => {
    const tab = TABS.find(t => t.value === value);
    if (tab && tab.href !== pathname) router.push(tab.href);
  };

  return (
    <div className={`${styles.wrap} ${className}`}>
      <Tabs value={current} onValueChange={onChange} className="w-full">
        <TabsList className={styles.list}>
          {TABS.map((t, i) => {
            const isActive = current === t.value;
            return (
              <TabsTrigger
                key={t.href}
                value={t.value}
                className={`${styles.triggerBase} ${styles.triggerActive} ${i === 0 ? "pl-0" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={isActive ? "text-orange-5" : "text-gray-4"}>
                  {t.icon(isActive)}
                </span>
                <span>{t.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}