export type ExperienceLabel = "0-2 Years" | "3-5 Years" | "5+ Years";

/** แปลง label จากฟอร์ม → ตัวเลขสำหรับเก็บใน DB */
export function labelToNumber(label?: string | null): number | null {
  if (!label) return null;
  if (label.startsWith("0-2")) return 2;
  if (label.startsWith("3-5")) return 5;
  if (label.startsWith("5+")) return 6;
  const n = Number(label);
  return Number.isFinite(n) ? n : null;
}

/** แปลงตัวเลขจาก DB → label สำหรับแสดงในฟอร์ม */
export function numberToLabel(n?: number | null): ExperienceLabel | "" {
  if (n == null) return "";
  if (n <= 2) return "0-2 Years";
  if (n <= 5) return "3-5 Years";
  return "5+ Years";
}