"use client";

import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import AlertConfirm from "./AlertConfirm";
import PrimaryButton from "../buttons/PrimaryButton";
import { useDatePicker } from "@/hooks/useDatePicker";
import { useTimePicker } from "@/hooks/useTimePicker";
import DatePicker from "../date-picker/DatePicker";
import { Calendar, Clock } from "lucide-react";
import TimePicker from "../time-picker/TimePicker";
import { useEffect, useRef, useState } from "react";

interface BookingChangeProps {
  bookingId: number;
  open: boolean;
  disabledDates: Date[];
  onOpenChange: (open: boolean) => void;
  onSubmitChangeDate: (bookingId: number, newStart: Date, newEnd: Date) => void;
  currentStart?: string; // เวลาเริ่มเดิมจาก booking (ISO string)
  currentEnd?: string;   // เวลาจบเดิมจาก booking (ISO string)
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

  // ป้องกัน init ซ้ำ
  const initedRef = useRef(false);

  // เมื่อ modal เปิด: init ค่าเริ่มต้นจาก currentStart / currentEnd "ครั้งเดียว"
  useEffect(() => {
    if (!open) {
      initedRef.current = false;
      return;
    }
    if (!initedRef.current && currentStart && currentEnd) {
      const start = new Date(currentStart);
      const end = new Date(currentEnd);
  
      handleSelect(start);
      setStartTime(start);
      setEndTime(end);
      setMonth(start);
  
      initedRef.current = true;
    }
  }, [open, currentStart, currentEnd, handleSelect, setStartTime, setEndTime, setMonth]);

  // ถ้า bookingId เปลี่ยน (เช่น เปลี่ยนรายการจอง) → อนุญาตให้ init ใหม่ครั้งต่อไปที่เปิด
  useEffect(() => {
    initedRef.current = false;
  }, [bookingId]);

  // เคลียร์ error เมื่อผู้ใช้แก้ค่า
  useEffect(() => {
    if (errorText && (date || startTime || endTime)) {
      setErrorText("");
    }
  }, [date, startTime, endTime, errorText]);

  const handleOnSubmit = () => {
    if (!date || !startTime || !endTime) {
      setErrorText("Please select a date and time to continue");
      return;
    }

    // รวม "วันที่จาก date" + "เวลา จาก startTime/endTime"
    const newStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      startTime.getHours(),
      startTime.getMinutes(),
      0,
      0
    );

    const newEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      endTime.getHours(),
      endTime.getMinutes(),
      0,
      0
    );

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
            {/* Date */}
            <div className="flex justify-start gap-3 pb-4">
              <Calendar className="text-gray-6" width={24} height={24} />
              <DatePicker
                date={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(d?: Date) => {
                  handleSelect(d);
                  // เปลี่ยนวันใหม่ → รีเซ็ตเวลา
                  setStartTime(undefined);
                  setEndTime(undefined);
                }}
                disabledDatesSlots={disabledDates}
                rules={{ disablePastDates: true }}
              />
            </div>

            {/* Time range */}
            <div className="flex justify-start gap-3">
              <Clock className="text-gray-6" width={24} height={24} />

              {/* Start Time */}
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

              {/* End Time */}
              <TimePicker
                date={date}
                value={endTime}
                onChange={setEndTime}
                // ❗ อย่าใช้ new Date() ตรง ๆ ใน prop — จะเปลี่ยนทุก render
                // ใช้ startTime เป็นตัวอ้างอิงเวลาเริ่ม หรือ undefined ถ้ายังไม่เลือก
                startDate={startTime ?? undefined}
                startTimeValue={startTime}
                disabled={!startTime}
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
              type="button"
              className="w-full"
              onClick={handleOnSubmit}
            />
          </div>
        </>
      }
    />
  );
}
