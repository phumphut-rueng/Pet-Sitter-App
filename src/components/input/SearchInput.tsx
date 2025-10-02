import { cn } from "@/lib/utils/utils";
import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;     // กด Enter แล้วให้ทำอะไร (ถ้าอยากผูก)
  clearable?: boolean;       // โชว์ปุ่มเคลียร์เมื่อมีค่า
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  onSubmit,
  clearable = true,
}: Props) {
  return (
    <div
      className={cn(
        // กล่อง 240×48 ตามดีไซน์
        "relative w-[240px] h-12",
        className
      )}
    >
      {/* field */}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) onSubmit();
        }}
        placeholder={placeholder}
        className={cn(
          // พื้นขาว มุมโค้ง ฟอนต์ body-sm (16/28, weight 500)
          "w-full h-full rounded-2xl bg-white",
          "border border-gray-200 px-4 pr-11", // เผื่อที่ให้ไอคอนขวา
          "body-sm text-ink/80 placeholder:text-gray-4",
          "outline-none focus:ring-2 ring-brand ring-offset-2 ring-offset-bg"
        )}
      />

      {/* ปุ่มเคลียร์ (โชว์เฉพาะตอนมีค่า) */}
      {clearable && value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-4" />
        </button>
      )}

      {/* ไอคอนแว่นขยายฝั่งขวา */}
      <Search
        aria-hidden
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-4 pointer-events-none"
      />
    </div>
  );
}