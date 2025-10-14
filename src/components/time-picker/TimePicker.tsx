// components/TimePicker.tsx
import { useCallback, useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import TimeDropdown from "./TimeDropdown"
import { formatDateToTimeString, generateTimeSlots, timeToMinutes, dateToMinutes, parseTimeStringToDate } from "@/lib/utils/time"
import { TimePickerProps } from "@/types/time-picker.types"

/**
 * TimePicker Component
 * 
 * Component สำหรับเลือกเวลา แสดงเป็น dropdown ที่มีช่วงเวลาให้เลือก
 * การทำงาน:
 * 1. สร้างรายการเวลาตามช่วงที่กำหนด (30 หรือ 60 นาที)
 * 2. แสดงเป็น dropdown เมื่อคลิกปุ่ม
 * 3. เมื่อเลือกเวลา จะส่งค่ากลับผ่าน onChange และปิด dropdown อัตโนมัติ
 * 4. รองรับการ disable เวลาที่ผ่านไปแล้ว และเช็ค endDate/endTime > startDate/startTime
 * 5. รองรับการ disable ช่วงเวลาเฉพาะเจาะจงผ่าน disabledTimeSlots
 * 6. สามารถควบคุมการแสดง/ซ่อนเวลาที่ disable แยกตามประเภทได้
 */

export default function TimePicker({
    value,
    onChange,
    placeholder = "Select time",
    className = "",
    TimeConfig = {},
    rules = {},
    date,
    disabled = false,
    startDate,
    startTimeValue,
    disabledTimeSlots = []
}: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const {
        disablePastTime = false,
        showDisabledSlots = true,
        showPastStartTime = false,
        showPastTime = false,
    } = rules

    const {
        startTime = 8,
        endTime = 23,
        interval = 30
    } = TimeConfig

    const displayValue = useMemo(
        () => formatDateToTimeString(value),
        [value]
    )
    const timeSlots = useMemo(
        () => generateTimeSlots(startTime, endTime, interval),
        [startTime, endTime, interval]
    )

    // ✅ logic เดิม check disable
    const checkTimeDisableStatus = useCallback((timeStr: string) => {
        const status = {
            isDisabledSlot: false,
            isPastStartTime: false,
            isPastTime: false
        }

        if (disabled) return { ...status, isDisabledSlot: true }

        const currentMinutes = timeToMinutes(timeStr)

        // เช็คว่าเวลาตรงกับ disabledTimeSlots หรือไม่
        if (disabledTimeSlots.length > 0 && date) {
            const currentTimeDate = parseTimeStringToDate(timeStr, date)

            // simplified matching
            const isInDisabledList = disabledTimeSlots.some(disabledDate =>
                disabledDate.getFullYear() === currentTimeDate.getFullYear() &&
                disabledDate.getMonth() === currentTimeDate.getMonth() &&
                disabledDate.getDate() === currentTimeDate.getDate() &&
                disabledDate.getHours() === currentTimeDate.getHours() &&
                disabledDate.getMinutes() === currentTimeDate.getMinutes()
            )

            if (isInDisabledList)
                status.isDisabledSlot = true
        }

        // เช็คว่าเวลาผ่านไปแล้วหรือไม่
        if (disablePastTime && date) {
            const now = new Date()
            if (date.toDateString() === now.toDateString()) {
                const nowMinutes = now.getHours() * 60 + now.getMinutes()

                const minAllowedMinutes = nowMinutes + 180 // นัดล่วงหน้า 3 ชั่วโมง
                if (currentMinutes <= minAllowedMinutes)
                    status.isPastTime = true
            }
        }

        // เช็คว่า endDate/endTime ต้องมากกว่า startDate/startTime
        if (startDate && date && startTimeValue) {
            // ถ้าเป็นวันเดียวกัน ให้เช็คเวลา
            if (date.toDateString() === startDate.toDateString()) {
                const startMinutes = dateToMinutes(startTimeValue)

                const minAllowedMinutes = startMinutes + 60 // เพิ่มขั้นต่ำ 1 ชั่วโมง
                if (currentMinutes < minAllowedMinutes)
                    status.isPastStartTime = true
            }
            // ถ้า endDate น้อยกว่า startDate ให้ disable ทั้งหมด
            else if (date < startDate) {
                status.isPastStartTime = true
            }
        }

        return status
    }, [disabled, disabledTimeSlots, date, disablePastTime, startDate, startTimeValue])

    const shouldHideTime = useCallback((
        status: ReturnType<typeof checkTimeDisableStatus>
    ): boolean => {
        if (status.isDisabledSlot && !showDisabledSlots) return true
        if (status.isPastStartTime && !showPastStartTime) return true
        if (status.isPastTime && !showPastTime) return true
        return false
    }, [showDisabledSlots, showPastStartTime, showPastTime])

    const isTimeDisabled = useCallback(
        (status: ReturnType<typeof checkTimeDisableStatus>) =>
            status.isDisabledSlot || status.isPastStartTime || status.isPastTime,
        []
    )

    return (
        <div className="relative flex-1">
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    flex justify-between items-center w-full h-12 px-3 
                    rounded-xl border border-gray-2 text-[16px] font-[400] 
                    ${disabled
                        ? "bg-gray-1 cursor-not-allowed opacity-60"
                        : "hover:border-gray-4 cursor-pointer"}
                    ${className}
                `}
                type="button"
            >
                <span className={displayValue ? "text-black" : "text-gray-4"}>
                    {displayValue || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-5 transition-transform 
                    ${isOpen
                        ? "rotate-180"
                        : ""}`} />
            </button>

            {isOpen && (
                <TimeDropdown
                    timeSlots={timeSlots}
                    displayValue={displayValue}
                    date={date}
                    onSelect={onChange}
                    checkStatus={checkTimeDisableStatus}
                    shouldHideTime={shouldHideTime}
                    isTimeDisabled={isTimeDisabled}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}
