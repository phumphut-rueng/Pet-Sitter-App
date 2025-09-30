import {
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import AlertConfirm from "./AlertConfirm"
import PrimaryButton from "../buttons/PrimaryButton"
import { useDatePicker } from "@/hooks/useDatePicker"
import { useTimePicker } from "@/hooks/useTimePicker"
import TimePicker from "../time-picker/TimePicker"
import DatePicker from "../date-picker/DatePicker"
import { Calendar, Clock } from 'lucide-react';

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
    const { date, month, setMonth, handleSelect } = useDatePicker()
    const { startTime, endTime, setStartTime, setEndTime } = useTimePicker()

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
                                    disabledDates={disabledDates}
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
                        {/* Actions */}
                        <div
                            className="flex justify-between gap-4 mt-4 ">
                            <PrimaryButton
                                text="Continue"
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
