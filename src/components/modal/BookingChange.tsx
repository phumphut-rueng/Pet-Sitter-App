"use client";

import {
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import AlertConfirm from "./AlertConfirm";
import PrimaryButton from "../buttons/PrimaryButton";
import { useDatePicker } from "@/hooks/useDatePicker";
import { useTimePicker } from "@/hooks/useTimePicker";
import DatePicker from "../date-picker/DatePicker";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import TimePicker from "../time-picker/TimePicker";
import { useState } from "react";
import { toast } from "sonner"; 

interface BookingChangeProps {
  sitterId: number;
  open: boolean;
  disabledDates: Date[];
  onOpenChange: (open: boolean) => void;
}

export default function BookingChange({
  sitterId,
  open,
  onOpenChange,
  disabledDates = [],
}: BookingChangeProps) {
  const { date, month, setMonth, handleSelect } = useDatePicker();
  const { startTime, endTime, setStartTime, setEndTime } = useTimePicker();
  const [errorText, setErrorText] = useState<string>("");

  const handleOnSubmit = () => {
    if (!date || !startTime || !endTime) {
      setErrorText("Please select a date and time to continue");
      return;
    }

    setErrorText("");
    onOpenChange(false); // ✅ ปิด dialog

    // ✅ Toast success (Sonner)
    toast.success("Changed date success", {
      description: "Your booking date and time have been updated.",
      icon: <CheckCircle className="text-green-600" size={20} />,
      duration: 3000,
      position: "bottom-right",
      className:
        "bg-green-50 border border-green-300 text-green-800 shadow-md rounded-xl px-4 py-3",
    });
  };

  return (
    <div>
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
                  onSelect={(date?: Date) => {
                    handleSelect(date);
                    setStartTime(undefined);
                    setEndTime(undefined);
                  }}
                  disabledDatesSlots={disabledDates}
                  rules={{
                    disablePastDates: true,
                  }}
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

            <div className="flex items-center justify-center p-2">
              <p className="text-[14px] text-error">{errorText}</p>
            </div>

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
    </div>
  );
}
