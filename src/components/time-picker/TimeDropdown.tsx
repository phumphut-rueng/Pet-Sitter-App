// components/TimeDropdown.tsx
import { parseTimeStringToDate } from "@/utils/time-utils"

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
    shouldHideTime: (status: any) => boolean
    isTimeDisabled: (status: any) => boolean
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
    return (
        <>
            {/* ปิด dropdown เมื่อคลิกข้างนอก */}
            <div
                className="fixed inset-0 z-30"
                onClick={onClose}
            />

            {/* รายการเวลา */}
            <div className="absolute mt-2 bg-white border border-gray-2 rounded-xl shadow-lg z-40 max-h-60 overflow-y-auto w-full">
                {timeSlots.filter(t => !shouldHideTime(checkStatus(t))).length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-4 text-[14px]">
                        No available time slots
                    </div>
                ) : (
                    timeSlots.map((time) => {
                        const status = checkStatus(time)
                        // ซ่อนเวลาที่ไม่ต้องการ
                        if (shouldHideTime(status)) return null
                        const disabled = isTimeDisabled(status)

                        return (
                            <button
                                key={time}
                                type="button"
                                onClick={() => {
                                    if (disabled) return
                                    const newDate = parseTimeStringToDate(time, date)
                                    onSelect(newDate)
                                    onClose()
                                }}
                                disabled={disabled}
                                className={`
                                    w-full px-4 py-3 
                                    text-left text-[14px] font-[500]
                                    ${disabled
                                        ? "bg-gray-1 text-gray-4 cursor-not-allowed"
                                        : displayValue === time
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
