import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ============================================
// CustomSelect - Component เดียวใช้ได้ทุกอย่าง
// ============================================
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
    // รองรับทั้ง string[], object[], และ custom mapping
    const normalizedOptions = options.map((opt) => {
        if (typeof opt === "string") {
            return { value: opt, label: opt };
        }
        if (getOptionValue && getOptionLabel) {
            return {
                value: getOptionValue(opt),
                label: getOptionLabel(opt),
            };
        }
        // Fallback สำหรับ { value, label }
        return opt as { value: string; label: string };
    });

    // Styles based on variant
    const triggerClass =
        variant === "filter"
            ? `${triggerSize} rounded-sm `
            : `${triggerSize} rounded-xl px-4 
            bg-white border-gray-2
            focus:border-orange-5 focus:ring-orange-5 focus:!ring-0 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-1
            ${error
                ? "border-red focus:ring-red"
                : "border-gray-2"
            } `;

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && <label className="font-medium text-black">{label}</label>}
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className={triggerClass}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-2 max-h-72 overflow-auto">
                    {normalizedOptions.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="cursor-pointer hover:bg-orange-1"
                        >
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-sm text-red">{error}</p>}
        </div>
    );
}