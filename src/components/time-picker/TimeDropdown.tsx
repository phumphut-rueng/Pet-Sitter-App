// components/TimeDropdown.tsx
import { parseTimeStringToDate, TimeStatus } from "@/utils/time-utils"

interface TimeDropdownProps {
    timeSlots: string[]
    displayValue: string
    date?: Date
    onSelect: (date: Date) => void
    checkStatus: (time: string) => {
        isDisabledSlot: boolean
        isPastStartTime: boolean
        isPastTime: boolean
    }
    shouldHideTime: (status: TimeStatus) => boolean
    isTimeDisabled: (status: TimeStatus) => boolean
    onClose: () => void
}

export default function TimeDropdown({
    timeSlots,
    displayValue,
    date,
    onSelect,
    checkStatus,
    shouldHideTime,
    isTimeDisabled,
    onClose
}: TimeDropdownProps) {
    const visibleSlots = timeSlots.filter(
        (time) => !shouldHideTime(checkStatus(time))
    )

    const handleSelect = (time: string, disabled: boolean) => {
        if (disabled) return
        const newDate = parseTimeStringToDate(time, date)
        onSelect(newDate)
        onClose()
    }
    return (
        <>
            {/* ปิด dropdown เมื่อคลิกข้างนอก */}
            <div
                className="fixed inset-0 z-30"
                onClick={onClose}
            />

            {/* รายการเวลา */}
            <div className="absolute mt-2 bg-white border border-gray-2 rounded-xl shadow-lg z-40 max-h-60 overflow-y-auto w-full">
                {visibleSlots.length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-4 text-[14px]">
                        No available time slots
                    </div>
                ) : (
                    visibleSlots.map((time) => {
                        const status = checkStatus(time)
                        const disabled = isTimeDisabled(status)
                        const isSelected = displayValue === time

                        return (
                            <button
                                key={time}
                                type="button"
                                onClick={() => {
                                    handleSelect(time, disabled)
                                }}
                                disabled={disabled}
                                className={`
                                    w-full px-4 py-3 
                                    text-left text-[14px] font-[500]
                                    ${disabled
                                        ? "bg-gray-1 text-gray-4 cursor-not-allowed"
                                        : isSelected
                                            ? "bg-orange-5 text-white"
                                            : "text-gray-9 hover:bg-orange-1 cursor-pointer"}
                                `}
                            >
                                {time}
                            </button>
                        )
                    })
                )}
            </div>
        </>
    )
}
