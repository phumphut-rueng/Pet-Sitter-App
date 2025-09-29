import {
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import AlertConfirm from "./AlertConfirm"
import PrimaryButton from "../buttons/PrimaryButton"
import { useState } from "react"
import Image from "next/image";
import { useDatePicker } from "@/hooks/useDatePicker"
import { useTimePicker } from "@/hooks/useTimePicker"
import TimePicker from "../date-time-picker/TimePicker"
import DatePicker from "../date-time-picker/DatePicker"

interface ConfirmationProps {
    title?: string
    description?: string
    textButton?: string
    open: boolean
    disabledDates: Date[],
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export default function BookingSelect({
    title = "Booking",
    description = "Select date and time you want to schedule the service.",
    textButton = "Continue",
    open,
    onOpenChange,
    onConfirm,
    disabledDates = [],
}: ConfirmationProps) {
    const { date, month, setMonth, handleSelect } = useDatePicker()

    const { startTime, endTime, setStartTime, setEndTime } = useTimePicker()
    return (
        <div>
            <AlertConfirm
                open={open}
                onOpenChange={onOpenChange}
                width={560}
                title={title}
                description={
                    <>
                        {/* Description */}
                        <AlertDialogDescription
                            className="pb-3 text-gray-6 whitespace-pre-line font-[500]">
                            {description}
                        </AlertDialogDescription>

                        <div className="space-y-3">
                            <div className="flex justify-start gap-3">
                                <Image
                                    src="/icons/ic-calendar.svg"
                                    alt="calendar"
                                    width={20}
                                    height={20}
                                />
                                <DatePicker
                                    date={date}
                                    month={month}
                                    onMonthChange={setMonth}
                                    onSelect={handleSelect}
                                    disabledDates={disabledDates}
                                />
                            </div>

                            {/* Time Picker */}
                            <div className="flex justify-start gap-3">
                                <Image
                                    src="/icons/ic-clock.svg"
                                    alt="time"
                                    width={20}
                                    height={20}
                                />
                                <TimePicker
                                    value={startTime}
                                    onChange={setStartTime}
                                    placeholder="Start time"
                                />
                                <span className="text-gray-4 flex items-center">-</span>
                                <TimePicker
                                    value={endTime}
                                    onChange={setEndTime}
                                    placeholder="End time"
                                />
                            </div>
                        </div>
                        {/* Actions */}
                        <div
                            className="flex justify-between gap-4 mt-4 ">
                            <PrimaryButton
                                text={textButton}
                                bgColor="primary"
                                textColor="white"
                                type="submit"
                                className="w-full"
                                onClick={() => onOpenChange(false)}
                            />
                        </div>
                    </>
                }
            />
        </div>
    )
}
