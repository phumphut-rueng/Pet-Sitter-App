import * as React from "react";
import { useRouter } from "next/router";
import type { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  route?: string;
  hasIndicator?: boolean;
  variant?: "desktop" | "mobile";
  "aria-label": string;
  onNavigate?: (path: string) => void;
  disabled?: boolean;
}

const IconButton = ({
  icon: Icon,
  onClick,
  route,
  hasIndicator = false,
  variant = "desktop",
  "aria-label": ariaLabel,
  onNavigate,
  disabled = false,
}: IconButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) onClick();
    else if (route && onNavigate) onNavigate(route);
  };

  // เช็ค active จากเส้นทางปัจจุบัน
  const isActive =
    !!route &&
    (router.asPath === route ||
      router.asPath.startsWith(route + "?") ||
      router.asPath.startsWith(route + "/"));

  const isDesktop = variant === "desktop";

  // ปล่อยให้ "สี" คุมที่ปุ่ม เพื่อให้ไอคอนตาม currentColor
  const buttonClasses = [
    "relative",
    "inline-flex items-center justify-center",
    "transition",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",

    // สีพื้นฐาน + hover/active
    "text-ink",
    "hover:text-orange-5",
    isDesktop ? "hover:bg-orange-1" : "",

    // active state
    isActive ? "text-orange-5" : "",
    isActive && isDesktop ? "bg-orange-1/40" : "",

    // ขนาด
    isDesktop ? "h-10 w-10 rounded-full" : "h-6 w-6",
  ].join(" ");

  // ไอคอนไม่กำหนดสี ให้รับ currentColor จากปุ่ม
  const iconClasses = isDesktop ? "h-5 w-5" : "h-5 w-5";
  const indicatorPos = isDesktop ? "top-0 right-0" : "-top-0.5 -right-0.5";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonClasses}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      disabled={disabled}
    >
      <Icon className={iconClasses} />
      {hasIndicator && (
        <span
          className={`absolute ${indicatorPos} h-2 w-2 rounded-full bg-red ring-2 ring-white`}
        />
      )}
    </button>
  );
};

export default IconButton;