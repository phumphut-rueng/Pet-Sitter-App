import React from "react";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils/utils";

interface InputTextAreaProps extends Omit<React.ComponentProps<typeof Textarea>, 'variant'> {
  label: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  error?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InputTextArea = ({
  label,
  placeholder,
  className,
  disabled,
  value,
  error,
  onChange,
  ...props
}: InputTextAreaProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={label}
        className="text-[16px] font-weight-500 font-medium text-black">
        {label}
      </label>
      <Textarea
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        {...props}
        className={cn(className,
          "w-full h-[144px] bg-white border border-gray-2 rounded-2 px-4 py-3 placeholder:text-gray-6 placeholder:text-[16px] placeholder:font-weight-400 placeholder:font-regular disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-gray-1 focus-visible:!border focus-visible:!border-orange-5 focus:!outline-none focus:!ring-0 focus-visible:!ring-0",
          error && "!border !border-red focus-visible:!border focus:!outline-none focus:!ring-0 focus-visible:!ring-0"
        )}
      />
    </div>
  );
}

export default InputTextArea;