import * as React from "react";
import { useMemo, useCallback } from "react";
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
const SVG_STYLES = { display: "block" } as const;

const ProfileIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" style={SVG_STYLES}>
    <circle cx={12} cy={8} r={3.25} fill="none" stroke="currentColor" strokeWidth={1.8} />
    <path d="M4.8 19c1.8-3 12.6-3 14.4 0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const PawIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" style={SVG_STYLES}>
    <circle cx={7.5} cy={8.5} r={2} fill="currentColor" />
    <circle cx={12} cy={6.5} r={2} fill="currentColor" />
    <circle cx={16.5} cy={8.5} r={2} fill="currentColor" />
    <path d="M8 15.5c0-1.9 1.6-3.5 4-3.5s4 1.6 4 3.5c0 2.1-1.8 3.3-4 3.3s-4-1.2-4-3.3z" fill="currentColor" />
  </svg>
);

const ListIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" style={SVG_STYLES}>
    <rect x={6} y={6.5} width={12} height={1.8} rx={0.9} fill="currentColor" />
    <rect x={6} y={11.1} width={12} height={1.8} rx={0.9} fill="currentColor" />
    <rect x={6} y={15.7} width={12} height={1.8} rx={0.9} fill="currentColor" />
    <circle cx={4.2} cy={7.4} r={0.9} fill="currentColor" />
    <circle cx={4.2} cy={12} r={0.9} fill="currentColor" />
    <circle cx={4.2} cy={16.6} r={0.9} fill="currentColor" />
  </svg>
);


const TAB_CONFIGS: readonly TabConfig[] = [
  { href: "/account/profile",  label: "Profile",         value: "profile",  icon: () => <ProfileIcon /> },
  { href: "/account/pet",      label: "Your Pet",        value: "pet",      icon: () => <PawIcon /> },
  { href: "/account/bookings", label: "Booking History", value: "bookings", icon: () => <ListIcon /> },
] as const;


const STYLES = {
  container: "w-full md:hidden",
  tabsList: `
    w-full h-14 p-0 bg-bg
    border-b border-border/20 rounded-none
    justify-start overflow-x-auto
  `,
  tabTrigger: {
    base: `
      flex-shrink-0 h-full flex items-center justify-start gap-2.5
      text-base font-bold whitespace-nowrap rounded-none
      transition-colors duration-200
      hover:bg-transparent
      focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg
      text-gray-7  /* inactive label */
    `,
    active: `
      data-[state=active]:text-orange-5
      data-[state=active]:bg-orange-1
      data-[state=active]:shadow-none
    `,
  },
} as const;

const findCurrentTab = (pathname: string) =>
  TAB_CONFIGS.find((t) => pathname.startsWith(t.href))?.value ?? TAB_CONFIGS[0].value;

const getTabPadding = (i: number) => (i === 0 ? "pl-0 pr-6" : "px-6");
const combineTabStyles = (i: number) => [STYLES.tabTrigger.base, STYLES.tabTrigger.active, getTabPadding(i)].join(" ");

export default function AccountTabsShadcn({ className = "" }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const currentValue = useMemo(() => findCurrentTab(pathname ?? ""), [pathname]);

  const handleValueChange = useCallback((value: string) => {
    const selected = TAB_CONFIGS.find((t) => t.value === value);
    if (selected) router.push(selected.href);
  }, [router]);

  return (
    <div className={`${STYLES.container} ${className}`}>
      <Tabs value={currentValue} onValueChange={handleValueChange} className="w-full">
        <TabsList className={STYLES.tabsList}>
          {TAB_CONFIGS.map((tab, index) => {
            const isActive = currentValue === tab.value;
            return (
              <TabsTrigger key={tab.href} value={tab.value} className={combineTabStyles(index)}>
                <span className={isActive ? "text-orange-5" : "text-gray-4"}>{tab.icon(isActive)}</span>
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}