import * as React from "react";
import { cn } from "@/lib/utils/utils";


type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  height?: number;
};


const THEME_COLORS = {
  border: "border-orange-100/70",
  background: "bg-orange-50/60 hover:bg-orange-50",
  icon: "border-orange-400",
  text: "text-orange-500"
} as const;

const STYLES = {
  button: `
    group grid w-full place-items-center rounded-3xl border
    cursor-pointer transition p-8 text-center
  `,
  iconContainer: "grid h-14 w-14 place-items-center rounded-full border-2",
  icon: "text-2xl leading-none",
  label: "font-semibold",
  content: "mx-auto grid place-items-center gap-3"
} as const;

const DEFAULT_HEIGHT = 260;


export default function CreateNewPetCard({
  onClick,
  className,
  height = DEFAULT_HEIGHT,
  style,
  ...rest
}: Props) {
  const buttonStyles = cn(
    STYLES.button,
    THEME_COLORS.border,
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