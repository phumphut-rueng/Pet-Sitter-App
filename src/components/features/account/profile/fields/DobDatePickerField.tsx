import { useState, useEffect, useMemo } from "react";
import { type Control } from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/profile";
import DatePicker from "@/components/date-picker/DatePicker";
import { FormField } from "./FormField";
import { toYmd, parseYmd, sameMonth, clampDay } from "../utils/date";

/** YYYY-MM-DD -> "DD/MMM/YYYY" (เช่น 18/May/2010) */
function formatDateDisplay(ymd?: string | null): string {
  if (!ymd) return "";
  
  const [y, m, d] = ymd.split("-");
  const year = Number(y);
  const month = Number(m) - 1;
  const day = Number(d);
  
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "";
  }
  
  const date = new Date(Date.UTC(year, month, day));
  const monthName = date.toLocaleString("en-GB", { month: "short" });
  const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  
  return `${String(day).padStart(2, "0")} ${monthCapitalized} ${year}`;
}

type DobPickerProps = {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
};

function DobPicker({ value, onChange, error }: DobPickerProps) {
  const [month, setMonth] = useState<Date | undefined>(undefined);
  const selected = useMemo(() => parseYmd(value), [value]);

  // วันที่สูงสุดที่เลือกได้: 15 ปีที่แล้วจากวันนี้ (ต้องอายุครบ 15 ปี)
  const maxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 15);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // วันที่ต่ำสุด: 120 ปีที่แล้ว (อายุไม่เกิน 120 ปี)
  const minDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 120);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Sync เดือนในปฏิทินกับวันที่เลือก
  useEffect(() => {
    if (!selected) {
      setMonth(undefined);
      return;
    }
    
    const newMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
    setMonth((prev) => (sameMonth(prev, newMonth) ? prev : newMonth));
  }, [selected]);

  const handleSelect = (date?: Date) => {
    const ymd = toYmd(date);
    if ((value ?? "") !== ymd) {
      onChange(ymd);
    }
  };

  const handleMonthChange = (newMonth?: Date) => {
    setMonth((prev) => (sameMonth(prev, newMonth) ? prev : newMonth));
    
    if (!newMonth || !selected) return;

    // Clamp วันให้อยู่ในเดือนใหม่
    const day = clampDay(newMonth.getFullYear(), newMonth.getMonth(), selected.getDate());
    let nextDate = new Date(newMonth.getFullYear(), newMonth.getMonth(), day);

    // ไม่ให้เกิน maxDate (15 ปีที่แล้ว)
    if (nextDate > maxDate) {
      nextDate = maxDate;
    }
    
    // ไม่ให้ต่ำกว่า minDate (120 ปีที่แล้ว)
    if (nextDate < minDate) {
      nextDate = minDate;
    }

    const nextYmd = toYmd(nextDate);
    if ((value ?? "") !== nextYmd) {
      onChange(nextYmd);
    }
  };

  const displayValue = useMemo(() => formatDateDisplay(value), [value]);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="date" className="text-sm2-medium text-gray-9">
        Date of Birth
      </label>

      <div
        className="relative [&_#date]:bg-white [&_#date]:text-transparent [&_#date]:caret-transparent [&_#date]:border-gray-2 [&_button]:cursor-pointer"
      >
        {/* Overlay text แสดง DD/MMM/YYYY */}
        <div
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm2-regular text-ink"
          aria-hidden="true"
        >
          {displayValue || ""}
        </div>

        <DatePicker
          date={selected}
          month={month}
          onMonthChange={handleMonthChange}
          onSelect={handleSelect}
          rules={{
            disablePastDates: false,
            minDate,
            maxDate,
          }}
          width={400}
        />
      </div>

      {error && <span className="text-sm2-regular text-red">{error}</span>}
    </div>
  );
}

type DobDatePickerFieldProps = {
  control: Control<OwnerProfileInput>;
};

export function DobDatePickerField({ control }: DobDatePickerFieldProps) {
  return (
    <FormField control={control} name="dob">
      {(field, fieldState) => (
        <DobPicker
          value={field.value as string | undefined}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    </FormField>
  );
}