import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Item = {
  id: "profile" | "pet" | "history" | "password";
  label: string;
  href: string;
  iconSrc: string;
};

export type AccountSidebarMiniProps = {
  className?: string;
  activeId?: Item["id"];
  onNavigate?: (id: Item["id"]) => void;
};


const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const IconMask = ({
  src,
  className = "w-5 h-5",
}: {
  src: string;
  className?: string;
}) => (
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
);

export default function AccountSidebarMini({
  className = "",
  activeId,
  onNavigate,
}: AccountSidebarMiniProps) {
  const router = useRouter();

  const items: Item[] = [
    {
      id: "profile",
      label: "Profile",
      href: "/account/profile",
      iconSrc: "/icons/ic-user.svg",
    },
    {
      id: "pet",
      label: "Your Pet",
      href: "/account/pet",
      iconSrc: "/icons/ic-paw.svg",
    },
    {
      id: "history",
      label: "Booking History",
      href: "/account/bookings",
      iconSrc: "/icons/ic-list.svg",
    },
    {
      id: "password",
      label: "Change Password",
      href: "/account/password",
      iconSrc: "/icons/ic-list.svg",
    },
  ];


  let current = activeId;
  if (!current) {
    const path = router.asPath || router.pathname || "";
    const found = items.find((i) => path.startsWith(i.href));
    current = found?.id ?? "profile";
  }

  return (
    <aside
      className={cn(

        "w-[292px] shrink-0 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm",
        className
      )}
    >
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Account</h2>
      </div>

      <nav className="px-2 pb-4">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = current === item.id;
            const base =
              "flex items-center gap-3 rounded-xl px-4 py-4 text-[15px] font-medium transition-colors";
            const state = isActive
              ? "bg-orange-50 text-orange-600"
              : "text-gray-700 hover:bg-orange-50 hover:text-orange-600 focus-visible:bg-orange-50 focus-visible:text-orange-600";

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(base, state, "outline-none")}
                  onClick={() => onNavigate?.(item.id)}
                >
                  <IconMask src={item.iconSrc} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}