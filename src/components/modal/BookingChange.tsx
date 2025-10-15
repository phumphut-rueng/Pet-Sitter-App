"use client";

import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import AlertConfirm from "./AlertConfirm";
import PrimaryButton from "../buttons/PrimaryButton";
import { useDatePicker } from "@/hooks/useDatePicker";
import { useTimePicker } from "@/hooks/useTimePicker";
import DatePicker from "../date-picker/DatePicker";
import { Calendar, Clock } from "lucide-react";
import TimePicker from "../time-picker/TimePicker";
import { useEffect, useState } from "react";

interface BookingChangeProps {
  bookingId: number;
  open: boolean;
  disabledDates: Date[];
  onOpenChange: (open: boolean) => void;
  onSubmitChangeDate: (bookingId: number, newStart: Date, newEnd: Date) => void;
  currentStart?: string; // 👈 เวลาเริ่มเดิมจาก booking
  currentEnd?: string;   // 👈 เวลาจบเดิมจาก booking
}

export default function BookingChange({
  bookingId,
  open,
  onOpenChange,
  disabledDates = [],
  onSubmitChangeDate,
  currentStart,  
  currentEnd, 
}: BookingChangeProps) {
  const { date, month, setMonth, handleSelect } = useDatePicker();
  const { startTime, endTime, setStartTime, setEndTime } = useTimePicker();
  const [errorText, setErrorText] = useState<string>("");

  useEffect(() => {
    if (open && currentStart && currentEnd) {
      const start = new Date(currentStart);
      const end = new Date(currentEnd);

      // ตั้งค่าใน date picker และ time picker
      handleSelect(start);
      setStartTime(start);
      setEndTime(end);
      setMonth(start);
    }
  }, [open, currentStart, currentEnd]);

  const handleOnSubmit = () => {
    if (!date || !startTime || !endTime) {
      setErrorText("Please select a date and time to continue");
      return;
    }

    const newStart = new Date(`${date.toDateString()} ${startTime.toTimeString()}`);
    const newEnd = new Date(`${date.toDateString()} ${endTime.toTimeString()}`);

    onSubmitChangeDate(bookingId, newStart, newEnd);
  };

  return (
    <AlertConfirm
      open={open}
      onOpenChange={onOpenChange}
      width={540}
      maxWidth="90vw"
      title="Change Date"
      description={
        <>
          <AlertDialogDescription className="pb-5 pt-2 px-5 text-gray-6 whitespace-pre-line font-[500]">
            Select date and time you want to change.
          </AlertDialogDescription>

          <div className="space-y-3 px-5 pb-8">
            <div className="flex justify-start gap-3 pb-4">
              <Calendar className="text-gray-6" width={24} height={24} />
              <DatePicker
                date={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(d?: Date) => {
                  handleSelect(d);
                  setStartTime(undefined);
                  setEndTime(undefined);
                }}
                disabledDatesSlots={disabledDates}
                rules={{ disablePastDates: true }}
              />
            </div>

            <div className="flex justify-start gap-3">
              <Clock className="text-gray-6" width={24} height={24} />
              <TimePicker
                date={date}
                value={startTime}
                onChange={setStartTime}
                disabled={!date}
                rules={{
                  disablePastTime: true,
                  showDisabledSlots: false,
                }}
                placeholder="Start time"
              />
              <span className="text-gray-4 flex items-center">-</span>
              <TimePicker
                date={date}
                value={endTime}
                onChange={setEndTime}
                startDate={startTime || new Date()}
                disabled={!startTime}
                startTimeValue={startTime}
                placeholder="End time"
              />
            </div>
          </div>

          {errorText && (
            <p className="text-[14px] text-error text-center mb-4">{errorText}</p>
          )}

          <div className="flex justify-between gap-4 px-5 pb-4">
            <PrimaryButton
              text="Confirm"
              bgColor="primary"
              textColor="white"
              type="submit"
              className="w-full"
              onClick={handleOnSubmit}
            />
          </div>
        </>
      }
    />
  );
}
