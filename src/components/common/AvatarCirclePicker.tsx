import * as React from "react";
import Image from "next/image";

/** Helper: File -> dataURL */
const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  });

export type AvatarCirclePickerValue = string | null | undefined;

export type AvatarCirclePickerProps = {
  /** dataURL หรือ URL ปัจจุบัน */
  value?: AvatarCirclePickerValue;
  /** ส่งค่า url (dataURL) กลับเมื่อเลือกไฟล์ใหม่ */
  onChange: (nextUrl: string) => void;
  /** เรียกเมื่อกดลบ (ไม่บังคับ) */
  onRemove?: () => void;

  /** ขนาดวงกลม (px) default 240 */
  sizePx?: number;
  /** accept ของ <input type="file"> */
  accept?: string;
  /** ซ่อนปุ่มลบ */
  hideRemove?: boolean;
  /** ปิดการใช้งานทั้งหมด */
  disabled?: boolean;

  /** แท็ก ARIA */
  "aria-label"?: string;
};

export default function AvatarCirclePicker({
  value,
  onChange,
  onRemove,
  sizePx = 240,
  accept = "image/*",
  hideRemove = false,
  disabled = false,
  "aria-label": ariaLabel = "Upload image",
}: AvatarCirclePickerProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const px = Math.max(80, sizePx); // safety

  const handlePick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    const url = await fileToDataURL(file);
    onChange(url);
  };

  const showImage = typeof value === "string" && value.trim().length > 0;

  return (
    <div className="inline-flex flex-col gap-3">
      {/* วงกลมพรีวิว */}
      <div
        className="relative overflow-hidden rounded-full bg-[#DDE0EE] ring-1 ring-border select-none"
        style={{ width: px, height: px }}
      >
        {showImage ? (
          <Image
            src={value as string}
            alt="Selected image"
            fill
            sizes={`${px}px`}
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <PawIcon className="text-white/95" size={Math.round(px * 0.36)} />
          </div>
        )}

        {/* ปุ่ม + ลอยมุมขวาล่าง */}
        <button
          type="button"
          aria-label={ariaLabel}
          onClick={handlePick}
          disabled={disabled}
          className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-[#FFF1EA] text-orange-500 shadow-sm ring-1 ring-orange-200
                     grid place-items-center hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50"
        >
          <PlusIcon />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.currentTarget.files?.[0] ?? null)}
        />
      </div>

      {/* ปุ่ม Remove (ถ้ามีรูป & ไม่ซ่อน) */}
      {showImage && !hideRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="self-start rounded-full border px-3 py-1.5 text-[13px] font-medium text-red-600 border-red-200 hover:bg-red-50
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300 disabled:opacity-50"
        >
          Remove
        </button>
      )}
    </div>
  );
}

/* ===== Icons (inline SVG) ===== */
function PlusIcon({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PawIcon({ className = "", size = 88 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <circle cx="84" cy="84" r="22" />
      <circle cx="172" cy="84" r="22" />
      <circle cx="60" cy="130" r="18" />
      <circle cx="196" cy="130" r="18" />
      <path d="M128 116c-28 0-38 18-48 36-7 12 7 28 22 22 16-6 28-6 44 0 15 6 29-10 22-22-10-18-20-36-40-36Z" />
    </svg>
  );
}