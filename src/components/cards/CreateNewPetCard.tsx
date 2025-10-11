import * as React from "react";
import { cn } from "@/lib/utils/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  height?: number;
};

const THEME_COLORS = {
  background: "bg-orange-1/60 hover:bg-orange-1",
  icon: "border-orange-5",
  text: "text-orange-5"
} as const;

const STYLES = {
  button: `
    group grid w-full place-items-center rounded-2xl
    cursor-pointer transition p-6 text-center
    focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg
  `,
  iconContainer: "grid h-14 w-14 place-items-center rounded-full border-[3px]",
  icon: "text-3xl font-bold leading-none",
  label: "text-sm2-bold",
  content: "mx-auto grid place-items-center gap-3"
} as const;

const DEFAULT_HEIGHT = 240;

export default function CreateNewPetCard({
  onClick,
  className,
  height = DEFAULT_HEIGHT,
  style,
  ...rest
}: Props) {
  const buttonStyles = cn(
    STYLES.button,
    THEME_COLORS.background,
    className
  );

  const iconContainerStyles = cn(
    STYLES.iconContainer,
    THEME_COLORS.icon
  );

  const textStyles = cn(
    STYLES.icon,
    THEME_COLORS.text
  );

  const labelStyles = cn(
    STYLES.label,
    THEME_COLORS.text
  );

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ minHeight: height, ...style }}
      className={buttonStyles}
      aria-label="Create New Pet"
      {...rest}
    >
      <div className={STYLES.content}>
        <div className={iconContainerStyles}>
          <span className={textStyles}>+</span>
        </div>

        <div className={labelStyles}>
          Create New Pet
        </div>
      </div>
    </button>
  );
}