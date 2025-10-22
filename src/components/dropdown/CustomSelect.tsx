import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CustomSelectProps<T = any> {
    value: string;
    onChange: (value: string) => void;
    options: T[];
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    variant?: "default" | "filter";
    triggerSize?: string;
    //optional functions สำหรับ custom mapping
    getOptionValue?: (option: T) => string;
    getOptionLabel?: (option: T) => string;
}

export function CustomSelect<T>({
    value,
    onChange,
    options,
    placeholder = "Select",
    label,
    error,
    disabled = false,
    className = "",
    variant = "default",
    triggerSize = "w-full",
    getOptionValue,
    getOptionLabel,
}: CustomSelectProps<T>) {
    // แปลง options ให้เป็นรูปแบบเดียวกัน
    const normalizedOptions = options.map((opt) => {
        // ถ้าเป็น string ธรรมดา
        if (typeof opt === "string") {
            return { value: opt, label: opt };
        }

        // ถ้ามี custom mapping function
        if (getOptionValue && getOptionLabel) {
            return {
                value: getOptionValue(opt),
                label: getOptionLabel(opt),
            };
        }

        // ถ้าเป็น object ที่มี value และ label อยู่แล้ว
        return opt as { value: string; label: string };
    });

    // สร้าง class สำหรับ trigger
    const getTriggerClasses = () => {
        // Base classes
        const baseClasses = triggerSize;

        // Filter variant (แบบง่าย)
        if (variant === "filter") {
            return `${baseClasses} rounded-sm`;
        }

        // Default variant (แบบเต็ม)
        const defaultClasses = [
            baseClasses,
            "rounded-xl px-4",
            "bg-white border-gray-2",
            "focus:border-orange-5 focus:ring-orange-5 focus:!ring-0",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-1",
            error ? "border-red focus:ring-red" : "border-gray-2",
        ];

        return defaultClasses.filter(Boolean).join(" ");
    };

    // Classes สำหรับ SelectItem
    const itemClasses = [
        "cursor-pointer",
        "hover:bg-orange-1 hover:text-orange-5",
        "data-[state=checked]:text-orange-5", // สีส้มเมื่อถูกเลือก
    ].join(" ");

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {/* Label */}
            {label && (
                <label className="font-medium text-black">
                    {label}
                </label>
            )}

            {/* Select Component */}
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className={getTriggerClasses()}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent
                    className="bg-white border border-gray-2 max-h-72 overflow-auto"
                >
                    {normalizedOptions.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className={itemClasses}
                        >
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red">
                    {error}
                </p>
            )}
        </div>
    );
}