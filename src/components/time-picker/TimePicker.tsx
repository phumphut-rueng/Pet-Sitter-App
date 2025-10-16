// components/TimePicker.tsx
import { useCallback, useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import TimeDropdown from "./TimeDropdown"
import {
    formatDateToTimeString,
    generateTimeSlots,
    timeToMinutes,
    dateToMinutes,
    parseTimeStringToDate
} from "@/lib/utils/time"
import { TimePickerProps, DisabledTimeRange } from "@/types/time-picker.types"

/**
 * TimePicker Component
 * 
 * รองรับ disabledTimeSlots เป็นช่วงเวลา (range) แทนเวลาเฉพาะจุด
 * format: [{ date_start: timestamp, date_end: timestamp }]
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

    // ✅ Helper: แปลง timestamp string/Date เป็น Date object
    const normalizeDate = useCallback((dateInput: Date | string): Date => {
        if (dateInput instanceof Date) return dateInput
        return new Date(dateInput)
    }, [])

    // ✅ Helper: เช็คว่าเวลาอยู่ในช่วง disabled หรือไม่
    const isTimeInDisabledRange = useCallback((
        checkTime: Date,
        ranges: DisabledTimeRange[]
    ): boolean => {
        return ranges.some(range => {
            const start = normalizeDate(range.date_start)
            const end = normalizeDate(range.date_end)

            // เช็คว่า checkTime อยู่ระหว่าง start และ end (inclusive)
            return checkTime >= start && checkTime <= end
        })
    }, [normalizeDate])

    // ✅ logic check disable (ปรับให้รองรับ range)
    const checkTimeDisableStatus = useCallback((timeStr: string) => {
        const status = {
            isDisabledSlot: false,
            isPastStartTime: false,
            isPastTime: false
        }

        if (disabled) return { ...status, isDisabledSlot: true }

        const currentMinutes = timeToMinutes(timeStr)

        // ✅ เช็คว่าเวลาอยู่ในช่วง disabledTimeSlots หรือไม่
        if (disabledTimeSlots.length > 0 && date) {
            const currentTimeDate = parseTimeStringToDate(timeStr, date)

            if (isTimeInDisabledRange(currentTimeDate, disabledTimeSlots)) {
                status.isDisabledSlot = true
            }
        }

        // เช็คว่าเวลาผ่านไปแล้วหรือไม่
        if (disablePastTime && date) {
            const now = new Date()
            if (date.toDateString() === now.toDateString()) {
                const nowMinutes = now.getHours() * 60 + now.getMinutes()
                const minAllowedMinutes = nowMinutes + 180 // นัดล่วงหน้า 3 ชั่วโมง

                if (currentMinutes <= minAllowedMinutes) {
                    status.isPastTime = true
                }
            }
        }

        // เช็คว่า endDate/endTime ต้องมากกว่า startDate/startTime
        if (startDate && date && startTimeValue) {
            if (date.toDateString() === startDate.toDateString()) {
                const startMinutes = dateToMinutes(startTimeValue)
                const minAllowedMinutes = startMinutes + 60 // เพิ่มขั้นต่ำ 1 ชั่วโมง

                if (currentMinutes < minAllowedMinutes) {
                    status.isPastStartTime = true
                }
            } else if (date < startDate) {
                status.isPastStartTime = true
            }
        }

        return status
    }, [
        disabled,
        disabledTimeSlots,
        date,
        disablePastTime,
        startDate,
        startTimeValue,
        isTimeInDisabledRange
    ])

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
                <ChevronDown
                    className={`w-4 h-4 text-gray-5 transition-transform 
            ${isOpen ? "rotate-180" : ""}`}
                />
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

// ========================================

// ตัวอย่างการใช้งาน
/*
// 1. จาก database (Neon PostgreSQL)
const disabledSlots = await db.query(`
  SELECT date_start, date_end 
  FROM appointments 
  WHERE date_start::date = $1
`, [selectedDate])

// 2. ใช้กับ TimePicker
<TimePicker
  value={endTime2}
  onChange={setEndTime2}
  date={new Date()}
  disabledTimeSlots={[
    {
      date_start: "2025-10-15T08:30:00Z",  // TIMESTAMP จาก DB
      date_end: "2025-10-15T09:30:00Z"
    },
    {
      date_start: new Date(2025, 9, 15, 9, 30),  // หรือใช้ Date object
      date_end: new Date(2025, 9, 15, 10, 30)
    }
  ]}
  rules={{
    showDisabledSlots: true
  }}
/>
*/