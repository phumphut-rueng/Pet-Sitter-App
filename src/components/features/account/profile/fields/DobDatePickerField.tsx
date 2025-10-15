import * as React from "react";
import { type Control } from "react-hook-form"; // ← ลบ useController ออก
import type { OwnerProfileInput } from "@/lib/validators/profile";
import DatePicker from "@/components/date-picker/DatePicker";
import { FormField } from "./FormField";
import { toYmd, parseYmd, sameMonth, clampDay } from "../utils/date";

/** YYYY-MM-DD -> "dd mon yyyy" (เช่น 02 sep 2025) */
function ymdToDMonYYYY(ymd?: string | null): string {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  const year = Number(y);
  const month = Number(m) - 1;
  const day = Number(d);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return "";
  const dt = new Date(Date.UTC(year, month, day));
  const mon = dt.toLocaleString("en-GB", { month: "short" }).toLowerCase(); // ← ให้เป็นตัวเล็ก
  return `${String(day).padStart(2, "0")} ${mon} ${String(year)}`;
}

type DobInnerProps = {
  value?: string;                 // เก็บในฟอร์มเป็น YYYY-MM-DD | ""
  onChange: (next: string) => void;
  error?: string;
};

const DobPickerInner: React.FC<DobInnerProps> = ({ value, onChange, error }) => {
  const [month, setMonth] = React.useState<Date | undefined>(undefined);
  const selected = React.useMemo(() => parseYmd(value), [value]);

  // sync เดือนในปฏิทินให้ตรงกับวันที่ที่เลือก
  React.useEffect(() => {
    if (!selected) {
      setMonth(undefined);
      return;
    }
    const m = new Date(selected.getFullYear(), selected.getMonth(), 1);
    setMonth((prev) => (sameMonth(prev, m) ? prev : m));
  }, [selected]);

  const handleSelect = (d?: Date) => {
    const next = toYmd(d); // เก็บในฟอร์มเป็น YYYY-MM-DD
    if ((value ?? "") !== next) onChange(next);
  };

  const handleMonthChange = (m?: Date) => {
    setMonth((prev) => (sameMonth(prev, m) ? prev : m));
    if (!m || !selected) return;

    const day = clampDay(m.getFullYear(), m.getMonth(), selected.getDate());
    let nextDate = new Date(m.getFullYear(), m.getMonth(), day);

    // ไม่ให้เกินวันนี้
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (nextDate > today) nextDate = today;

    const nextStr = toYmd(nextDate);
    if ((value ?? "") !== nextStr) onChange(nextStr);
  };

  // ช่วงวันที่เลือกได้: ย้อนหลัง 100 ปีถึงวันนี้
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const min = React.useMemo(() => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 100);
    return d;
  }, [today]);

  // ข้อความที่จะแสดงในช่อง (overlay)
  const display = React.useMemo(() => ymdToDMonYYYY(value), [value]);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="date" className="text-sm2-medium text-gray-9">
        Date of Birth
      </label>

      {/* ซ่อนข้อความใน input ของ DatePicker แล้ว overlay ข้อความของเรา */}
      <div
        className={`
          relative
          [&_#date]:bg-white [&_#date]:text-transparent [&_#date]:caret-transparent
          [&_#date]:border-gray-2 [&_button]:cursor-pointer
        `}
      >
        {/* overlay: แสดง dd mon yyyy (เช่น 02 sep 2025) */}
        <div
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm2-regular text-ink"
          aria-hidden="true"
        >
          {display || ""}
        </div>

        <DatePicker
          date={selected}
          month={month}
          onMonthChange={handleMonthChange}
          onSelect={handleSelect}
          rules={{
            disablePastDates: false,
            minDate: min,
            maxDate: today,
          }}
          width={400}
        />
      </div>

      {error && <span className="text-sm2-regular text-red">{error}</span>}
    </div>
  );
};

export const DobDatePickerField: React.FC<{ control: Control<OwnerProfileInput> }> = ({
  control,
}) => (
  <FormField control={control} name="dob">
    {(field, fieldState) => (
      <DobPickerInner
        value={field.value as string | undefined}
        onChange={field.onChange}
        error={fieldState.error?.message}
      />
    )}
  </FormField>
);