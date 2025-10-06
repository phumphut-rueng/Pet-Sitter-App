import {
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import AlertConfirm from "./AlertConfirm"
import PrimaryButton from "../buttons/PrimaryButton"
import { useDatePicker } from "@/hooks/useDatePicker"
import { useTimePicker } from "@/hooks/useTimePicker"
import DatePicker from "../date-picker/DatePicker"
import { Calendar, Clock } from 'lucide-react';
import TimePicker from "../time-picker/TimePicker"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/router"

interface BookingSelectProps {
    sitterId: number
    open: boolean
    disabledDates: Date[],
    onOpenChange: (open: boolean) => void
}

export default function BookingSelect({
    sitterId = 1,
    open,
    onOpenChange,
    disabledDates = [],
}: BookingSelectProps) {
    const router = useRouter()
    const { date, month, setMonth, handleSelect } = useDatePicker()
    const { startTime, endTime, setStartTime, setEndTime } = useTimePicker()

    const [errorText, setErrorText] = useState<string>("")

    const hendleOnSubmit = () => {
        console.log("date", date);

        if (!date || !startTime || !endTime) {
            setErrorText("Please select a date and time to continue");
            return
        }
        setErrorText("")

        router.push({
            pathname: '/booking',
            query: {
                date: date.toISOString(),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                sitterId: sitterId
            }
        })
    }

    return (
        <div>
            <AlertConfirm
                open={open}
                onOpenChange={onOpenChange}
                width={560}
                title="Booking"
                description={
                    <>
                        {/* Description */}
                        <AlertDialogDescription
                            className="pb-3 text-gray-6 whitespace-pre-line font-[500]">
                            Select date and time you want to schedule the service.
                        </AlertDialogDescription>

                        <div className="space-y-3">
                            <div className="flex justify-start gap-3">
                                <Calendar
                                    className="text-gray-6"
                                    width={24}
                                    height={24}
                                />
                                <DatePicker
                                    date={date}
                                    month={month}
                                    onMonthChange={setMonth}
                                    onSelect={(date?: Date) => {
                                        handleSelect(date)
                                        setStartTime(undefined)
                                        setEndTime(undefined)
                                    }}
                                    disabledDatesSlots={disabledDates}
                                    rules={{
                                        disablePastDates: true,
                                    }}
                                />
                            </div>

                            {/* Time Picker */}
                            <div className="flex justify-start gap-3">
                                <Clock
                                    className="text-gray-6"
                                    width={24}
                                    height={24}
                                />
                                <TimePicker
                                    date={date}
                                    value={startTime}
                                    onChange={setStartTime}
                                    disabled={!date ? true : false}
                                    rules={{
                                        disablePastTime: true, showDisabledSlots: false,
                                    }}
                                    placeholder="Start time"
                                />
                                <span className="text-gray-4 flex items-center">-</span>
                                <TimePicker
                                    date={date}
                                    value={endTime}
                                    onChange={setEndTime}
                                    startDate={startTime || new Date()}
                                    disabled={!startTime ? true : false}
                                    startTimeValue={startTime}
                                    placeholder="End time"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-center p-2">
                            <p className="text-[14px] text-error">{errorText}</p>
                        </div>
                        {/* Actions */}
                        <div
                            className="flex justify-between gap-4">
                            <PrimaryButton
                                text="Continue"
                                bgColor="primary"
                                textColor="white"
                                type="submit"
                                className="w-full"
                                onClick={hendleOnSubmit}
                            />
                        </div>
                    </>
                }
            />
        </div>
    )
}
