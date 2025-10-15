import React from "react";
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
  const handleClick = () => {
    if (disabled) return;

    if (onClick) onClick();
    else if (route && onNavigate) onNavigate(route);
  };

  const isDesktop = variant === "desktop";

  const buttonClasses = [
    "relative",
    "transition-colors",
    "flex items-center justify-center",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",

    isDesktop ? "w-12 h-12 rounded-full bg-gray-1 hover:bg-gray-2" : "w-6 h-6",
  ].join(" ");

  const iconClasses = isDesktop ? "w-6 h-6 text-gray-6" : "w-6 h-6 text-gray-6";
  const indicatorPos = isDesktop ? "top-2 right-2" : "top-0 right-0";

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
        <div className={`absolute ${indicatorPos} w-3 h-3 bg-orange-5 rounded-full`} />
      )}
    </button>
  );
};

export default IconButton;