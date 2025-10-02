import * as React from "react";
import { Control } from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/account";
import DatePicker from "@/components/date-picker/DatePicker";
import { FormField } from "./FormField";
import { toYmd, parseYmd, sameMonth, clampDay } from "../utils/date";

type DobInnerProps = {
  value?: string;
  onChange: (next: string) => void;
  error?: string;
};

const DobPickerInner: React.FC<DobInnerProps> = ({ value, onChange, error }) => {
  const [month, setMonth] = React.useState<Date | undefined>(undefined);
  const selected = React.useMemo(() => parseYmd(value), [value]);

  React.useEffect(() => {
    if (!selected) {
      setMonth((prev) => (prev ? undefined : prev));
      return;
    }
    const m = new Date(selected.getFullYear(), selected.getMonth(), 1);
    setMonth((prev) => (sameMonth(prev, m) ? prev : m));
  }, [selected]);

  const handleSelect = (d?: Date) => {
    const next = toYmd(d);
    const prev = value ?? "";
    if (next !== prev) onChange(next);
  };

  const handleMonthChange = (m?: Date) => {
    setMonth((prev) => (sameMonth(prev, m) ? prev : m));
    if (!m || !selected) return;

    const day = clampDay(m.getFullYear(), m.getMonth(), selected.getDate());
    let nextDate = new Date(m.getFullYear(), m.getMonth(), day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (nextDate > today) nextDate = today;

    const nextStr = toYmd(nextDate);
    const prevStr = value ?? "";
    if (nextStr !== prevStr) onChange(nextStr);
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="date" className="text-sm font-medium text-gray-700">
        Date of Birth
      </label>
      <div className="[&_#date]:bg-white [&_#date]:text-black [&_#date]:border-gray-300 [&_button]:cursor-pointer">
        <DatePicker
          date={selected}
          month={month}
          onMonthChange={handleMonthChange}
          onSelect={handleSelect}
          rules={{ maxDate: new Date() }}
          width={400}
        />
      </div>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
};

export const DobDatePickerField: React.FC<{
  control: Control<OwnerProfileInput>;
}> = ({ control }) => (
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