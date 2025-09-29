import {
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import AlertConfirm from "./AlertConfirm"
import PrimaryButton from "../buttons/PrimaryButton"
import { useState } from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import InputText from "../input/InputText";
import Image from "next/image";
import { format } from "date-fns"

interface ConfirmationProps {
    title?: string
    description?: string
    textButton?: string
    open: boolean
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
}: ConfirmationProps) {
    const [selected, setSelected] = useState<Date>();
    const [isOpen, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [month, setMonth] = useState<Date | undefined>(date)
    const [value, setValue] = useState(formatDate(date))

    function formatDate(date: Date | undefined) {
        if (!date) {
            return ""
        }
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
    }
    function isValidDate(date: Date | undefined) {
        if (!date) {
            return false
        }
        return !isNaN(date.getTime())
    }

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

                        <div className="flex justify-start gap-3">
                            <Image
                                src="/icons/ic-calendar.svg"
                                alt="calendar"
                                width={20}
                                height={20}
                            />
                            <Popover open={isOpen} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        id="date"
                                        className="flex justify-start items-center w-full h-12 px-3 rounded-xl border border-gray-2 text-[16px] font-[400] text-black"
                                    >
                                        {date ? format(date, "dd MMM, yyyy") : "Select date"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto overflow-hidden p-0 bg-white border border-gray-2 shadow"
                                    align="start"
                                >
                                    <Calendar
                                        className="w-[355px]"
                                        mode="single"
                                        selected={date}
                                        captionLayout="label"
                                        month={month}
                                        onMonthChange={setMonth}
                                        onSelect={(date) => {
                                            setDate(date)
                                            setValue(formatDate(date))
                                            setOpen(false)
                                        }}
                                        disabled={(date) =>
                                            date < new Date()
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex justify-start gap-3">
                            {/* <Image
                                src="/icons/ic-clock.svg"
                                alt="time"
                                width={20}
                                height={20}
                            /> */}
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
