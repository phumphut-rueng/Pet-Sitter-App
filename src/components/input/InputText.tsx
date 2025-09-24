import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { cva } from "class-variance-authority";
import Image from "next/image";

interface InputTextProps extends React.ComponentProps<typeof Input> {
  label: string;
  placeholder: string;
  type: string;
  variant: "default" | "error" | "success";
  className?: string;
  disabled?: boolean;
  value?: string;
  errorText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputText = ({
  label,
  placeholder,
  type,
  variant,
  className,
  disabled,
  value,
  errorText = "",
  onChange,
  ...props
}: InputTextProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={label}
        className="text-[16px] font-weight-500 font-medium text-black"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          {...props}
          id={label}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          className={cn(
            inputTextVariants({ variant }),
            className,
            "h-12 bg-white border border-gray-2 rounded-2 px-4 py-3 placeholder:text-gray-6 placeholder:text-[16px] placeholder:font-weight-400 placeholder:font-regular disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-1"
          )}
        />
        {variant === "error" && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Image
              src="/icons/Exclamation-circle.svg"
              alt="Error"
              width={16}
              height={16}
            />
          </div>
        )}
      </div>
      {
        errorText && (
          <p className="text-[14px] text-error">{errorText}</p>
        )
      }
    </div>
  );
};

const inputTextVariants = cva("w-full", {
  variants: {
    variant: {
      default:
        "focus-visible:!border focus-visible:!border-orange-5 focus:!outline-none focus:!ring-0 focus-visible:!ring-0",
      success:
        "focus-visible:!border focus-visible:!border-orange-5 focus:!outline-none focus:!ring-0 focus-visible:!ring-0",
      error:
        "!border !border-red focus-visible:!border focus:!outline-none focus:!ring-0 focus-visible:!ring-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export default InputText;
