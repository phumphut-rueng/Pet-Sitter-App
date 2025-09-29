"use client";

import * as React from "react";
import { useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---- Types ---- */
type IconProps = { active?: boolean };

type TabConfig = { 
  href: string; 
  label: string; 
  icon: (active: boolean) => React.ReactElement;
  value: string;
};

type Props = {
  className?: string;
};

/* ---- Constants ---- */
const OPACITY = {
  ACTIVE: 1,
  INACTIVE: 0.45,
} as const;

const ICON_SIZE = {
  WIDTH: 24,
  HEIGHT: 24,
} as const;

const SVG_STYLES = { display: "block" } as const;

/* ---- Icon Components ---- */
const ProfileIcon: React.FC<IconProps> = React.memo(({ active }) => {
  const opacity = active ? OPACITY.ACTIVE : OPACITY.INACTIVE;
  
  return (
    <svg width={ICON_SIZE.WIDTH} height={ICON_SIZE.HEIGHT} viewBox="0 0 24 24" style={SVG_STYLES}>
      <circle 
        cx={12} 
        cy={8} 
        r={3.25} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={1.8} 
        opacity={opacity} 
      />
      <path 
        d="M4.8 19c1.8-3 12.6-3 14.4 0" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={1.8} 
        opacity={opacity} 
        strokeLinecap="round" 
      />
    </svg>
  );
});
ProfileIcon.displayName = "ProfileIcon";

const PawIcon: React.FC<IconProps> = React.memo(({ active }) => {
  const opacity = active ? OPACITY.ACTIVE : OPACITY.INACTIVE;
  
  return (
    <svg width={ICON_SIZE.WIDTH} height={ICON_SIZE.HEIGHT} viewBox="0 0 24 24" style={SVG_STYLES}>
      <circle cx={7.5} cy={8.5} r={2} fill="currentColor" opacity={opacity} />
      <circle cx={12} cy={6.5} r={2} fill="currentColor" opacity={opacity} />
      <circle cx={16.5} cy={8.5} r={2} fill="currentColor" opacity={opacity} />
      <path 
        d="M8 15.5c0-1.9 1.6-3.5 4-3.5s4 1.6 4 3.5c0 2.1-1.8 3.3-4 3.3s-4-1.2-4-3.3z" 
        fill="currentColor" 
        opacity={opacity} 
      />
    </svg>
  );
});
PawIcon.displayName = "PawIcon";

const ListIcon: React.FC<IconProps> = React.memo(({ active }) => {
  const opacity = active ? OPACITY.ACTIVE : OPACITY.INACTIVE;
  
  return (
    <svg width={ICON_SIZE.WIDTH} height={ICON_SIZE.HEIGHT} viewBox="0 0 24 24" style={SVG_STYLES}>
      <rect x={6} y={6.5} width={12} height={1.8} rx={0.9} fill="currentColor" opacity={opacity} />
      <rect x={6} y={11.1} width={12} height={1.8} rx={0.9} fill="currentColor" opacity={opacity} />
      <rect x={6} y={15.7} width={12} height={1.8} rx={0.9} fill="currentColor" opacity={opacity} />
      <circle cx={4.2} cy={7.4} r={0.9} fill="currentColor" opacity={opacity} />
      <circle cx={4.2} cy={12} r={0.9} fill="currentColor" opacity={opacity} />
      <circle cx={4.2} cy={16.6} r={0.9} fill="currentColor" opacity={opacity} />
    </svg>
  );
});
ListIcon.displayName = "ListIcon";

/* ---- Tab Configuration ---- */
const TAB_CONFIGS: readonly TabConfig[] = [
  { 
    href: "/account/profile", 
    label: "Profile", 
    value: "profile", 
    icon: (active) => <ProfileIcon active={active} /> 
  },
  { 
    href: "/account/pet", 
    label: "Your Pet", 
    value: "pet", 
    icon: (active) => <PawIcon active={active} /> 
  },
  { 
    href: "/account/bookings", 
    label: "Booking History", 
    value: "bookings", 
    icon: (active) => <ListIcon active={active} /> 
  },
] as const;

/* ---- Styles ---- */
const STYLES = {
  container: "w-full md:hidden",
  tabsList: `
    w-full h-14 p-0 bg-[var(--surface)] 
    border-b border-slate-200/20 rounded-none 
    justify-start overflow-x-auto
  `,
  tabTrigger: {
    base: `
      flex-shrink-0 h-full flex items-center justify-start gap-2.5
      text-base font-bold whitespace-nowrap rounded-none
      transition-colors duration-200
      hover:bg-transparent
      focus-visible:ring-0 focus-visible:ring-offset-0
    `,
    active: `
      data-[state=active]:bg-orange-100 
      data-[state=active]:text-orange-600
      data-[state=active]:shadow-none
    `,
    inactive: "data-[state=inactive]:text-slate-500"
  }
} as const;

/* ---- Utility Functions ---- */
const findCurrentTab = (pathname: string): string => {
  const matchedTab = TAB_CONFIGS.find((tab) => pathname.startsWith(tab.href));
  return matchedTab ? matchedTab.value : TAB_CONFIGS[0].value;
};

const getTabPadding = (index: number): string => {
  return index === 0 ? 'pl-0 pr-6' : 'px-6';
};

const combineTabStyles = (index: number): string => {
  return [
    STYLES.tabTrigger.base,
    STYLES.tabTrigger.active,
    STYLES.tabTrigger.inactive,
    getTabPadding(index)
  ].join(' ');
};

/* ---- Main Component ---- */
export default function AccountTabsShadcn({ className = "" }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const currentValue = useMemo(
    () => findCurrentTab(pathname ?? ""), 
    [pathname]
  );

  const handleValueChange = useCallback((value: string) => {
    const selectedTab = TAB_CONFIGS.find(tab => tab.value === value);
    if (selectedTab) {
      router.push(selectedTab.href);
    }
  }, [router]);

  const containerClassName = `${STYLES.container} ${className}`;

  return (
    <div className={containerClassName}>
      <Tabs 
        value={currentValue} 
        onValueChange={handleValueChange}
        className="w-full"
      >
        <TabsList className={STYLES.tabsList}>
          {TAB_CONFIGS.map((tab, index) => {
            const isActive = currentValue === tab.value;
            
            return (
              <TabsTrigger
                key={tab.href}
                value={tab.value}
                className={combineTabStyles(index)}
              >
                {tab.icon(isActive)}
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}