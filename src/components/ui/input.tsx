import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Image from "next/image"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    "w-full h-12 px-3 pl-3 text-sm border transition-all outline-none gap-2",
    "rounded-lg opacity-100 bg-[var(--white)]",
    "placeholder:text-[var(--gray-6)] selection:bg-transparent",
    "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
  ],
  {
    variants: {
      variant: {
        default: [
          "border-[#DCDFED] pr-4",
          "focus:border-[var(--orange-5)] focus:outline-none"
        ],
        success: [
          "border-[#DCDFED] pr-4",
          "focus:border-[var(--orange-5)] focus:outline-none"
        ],
        error: [
          "border-[#EA1010] pr-12",
          "focus:border-[var(--red)] focus:outline-none"
        ]
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    if (variant === "error") {
      return (
        <div className="relative w-full">
          <input
            type={type}
            data-slot="input"
            className={cn(inputVariants({ variant }), className)}
            ref={ref}
            {...props}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Image
              src="/icons/Exclamation-circle.svg"
              alt="Error"
              width={16}
              height={16}
            />
          </div>
        </div>
      )
    }

    return (
      <input
        type={type}
        data-slot="input"
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
