import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface TimePickerProps {
    value: Date | undefined //ค่าเวลาที่เลือกปัจจุบัน (Date object)
    onChange: (date: Date) => void //Function ที่เรียกเมื่อเลือกเวลาใหม่ (ส่ง Date กลับ)
    placeholder?: string //ข้อความแสดงเมื่อยังไม่ได้เลือกเวลา
    className?: string //CSS class เพิ่มเติมสำหรับปุ่ม
    date?: Date //วันที่ทำการเลือกอยู่
    disabled?: boolean //ปิดการใช้งาน TimePicker
    startDate?: Date //วันที่เริ่มต้น (สำหรับ endDate picker เช็คว่าต้องมากกว่า startDate)
    startTimeValue?: Date | null //เวลาเริ่มต้นที่เลือก (สำหรับเช็คว่า end ต้องมากกว่า start)
    disabledTimeSlots?: Date[] //รายการเวลาที่ต้องการ disable (Array ของ Date objects)

    rules?: {
        disablePastTime?: boolean //ไม่ให้เลือกเวลาที่ผ่านไปแล้ว
        showDisabledSlots?: boolean //แสดงเวลาที่ถูก disable จาก disabledTimeSlots (true = แสดงเป็นสีเทา, false = ซ่อน) (default: true)
        showPastStartTime?: boolean //แสดงเวลาก่อน startDate/startTime (true = แสดงเป็นสีเทา, false = ซ่อน) (default: true)
        showPastTime?: boolean //แสดงเวลาที่ผ่านไปแล้ว (true = แสดงเป็นสีเทา, false = ซ่อน) (default: true)
    }

    TimeConfig?: {
        startTime?: number // เวลาเริ่ม ส่งมาแบบ 24h (default: 8:00)
        endTime?: number // เวลาสิ้นสุด ส่งมาแบบ 24h (default: 23:00)
        interval?: 30 | 60 // ช่วงเวลา 30 หรือ 60 นาที (default: 30)
    }
}

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
export default function TimePickerOld({
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

    // แปลง Date เป็น string format "8:30 AM"
    const formatDateToTimeString = (date: Date | undefined): string => {
        if (!date) return ""

        const hours = date.getHours()
        const minutes = date.getMinutes()

        const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
        const period = hours >= 12 ? 'PM' : 'AM'

        return `${h}:${minutes.toString().padStart(2, '0')} ${period}`
    }

    // แปลง string format "8:30 AM" เป็น Date
    const parseTimeStringToDate = (timeStr: string, baseDate?: Date): Date => {
        const [time, period] = timeStr.split(' ')
        const [hours, minutes] = time.split(':').map(Number)
        let hour24 = hours

        if (period === 'PM' && hours !== 12) {
            hour24 = hours + 12
        } else if (period === 'AM' && hours === 12) {
            hour24 = 0
        }

        const newDate = baseDate ? new Date(baseDate) : new Date()
        newDate.setHours(hour24, minutes, 0, 0)
        return newDate
    }

    const displayValue = formatDateToTimeString(value)

    //สร้างรายการช่วงเวลาทุก 30 หรือ 60 นาที ของเวลาในรูปแบบ ["H:MM AM/PM"]
    const generateTimeSlots = () => {
        const times: string[] = []

        // Loop ชั่วโมงจาก startTime ถึง endTime
        for (let hour = startTime; hour <= endTime; hour++) {
            // Loop นาทีตาม interval ที่กำหนด
            for (let minute = 0; minute < 60; minute += interval) {
                // หยุดที่ endTime (ไม่เอาเกิน)
                if (hour === endTime && minute > 0) break

                // แปลงเป็นรูปแบบ 12 ชั่วโมง
                const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour

                // กำหนด AM/PM
                const period = hour >= 12 ? 'PM' : 'AM'

                // สร้าง string เวลา เช่น "8:00 AM", "8:30 AM"
                const timeStr = `${h}:${minute.toString().padStart(2, '0')} ${period}`
                times.push(timeStr)
            }
        }
        return times
    }

    // แปลงเวลาจาก string เป็นนาทีเพื่อเปรียบเทียบ
    const timeToMinutes = (timeStr: string): number => {
        const [time, period] = timeStr.split(' ')
        const [hours, minutes] = time.split(':').map(Number)
        let hour24 = hours

        if (period === 'PM' && hours !== 12) {
            hour24 = hours + 12
        } else if (period === 'AM' && hours === 12) {
            hour24 = 0
        }

        return hour24 * 60 + minutes
    }

    // แปลง Date เป็นนาทีเพื่อเปรียบเทียบ
    const dateToMinutes = (date: Date): number => {
        return date.getHours() * 60 + date.getMinutes()
    }

    // เช็คว่าเวลานี้ถูก disable หรือไม่ (แยกตามประเภท)
    const checkTimeDisableStatus = (timeStr: string) => {
        const status = {
            isDisabledSlot: false,      // disable จาก disabledTimeSlots
            isPastStartTime: false,     // disable เพราะก่อน startDate/startTime
            isPastTime: false,          // disable เพราะเวลาผ่านไปแล้ว
        }

        // ถ้า disabled ทั้งหมด
        if (disabled) {
            return { ...status, isDisabledSlot: true }
        }

        const currentMinutes = timeToMinutes(timeStr)

        // เช็คว่าเวลาตรงกับ disabledTimeSlots หรือไม่
        if (disabledTimeSlots.length > 0 && date) {
            const currentTimeDate = parseTimeStringToDate(timeStr, date)

            const isInDisabledList = disabledTimeSlots.some(disabledDate => {
                return (
                    disabledDate.getFullYear() === currentTimeDate.getFullYear() &&
                    disabledDate.getMonth() === currentTimeDate.getMonth() &&
                    disabledDate.getDate() === currentTimeDate.getDate() &&
                    disabledDate.getHours() === currentTimeDate.getHours() &&
                    disabledDate.getMinutes() === currentTimeDate.getMinutes()
                )
            })

            if (isInDisabledList) {
                status.isDisabledSlot = true
            }
        }

        // เช็คว่าเวลาผ่านไปแล้วหรือไม่
        if (disablePastTime && date) {
            const now = new Date()
            const selectedDate = new Date(date)

            // ถ้าเป็นวันนี้ ให้เช็คเวลา
            if (
                selectedDate.getDate() === now.getDate() &&
                selectedDate.getMonth() === now.getMonth() &&
                selectedDate.getFullYear() === now.getFullYear()
            ) {
                const currentHour = now.getHours()
                const currentMinute = now.getMinutes()
                const nowMinutes = currentHour * 60 + currentMinute

                if (currentMinutes <= nowMinutes) {
                    status.isPastTime = true
                }
            }
        }

        // เช็คว่า endDate/endTime ต้องมากกว่า startDate/startTime
        if (startDate && date && startTimeValue) {
            const startDateObj = new Date(startDate)
            const endDateObj = new Date(date)

            // ถ้าเป็นวันเดียวกัน ให้เช็คเวลา
            if (
                startDateObj.getDate() === endDateObj.getDate() &&
                startDateObj.getMonth() === endDateObj.getMonth() &&
                startDateObj.getFullYear() === endDateObj.getFullYear()
            ) {
                const startMinutes = dateToMinutes(startTimeValue)
                if (currentMinutes <= startMinutes) {
                    status.isPastStartTime = true
                }
            }
            // ถ้า endDate น้อยกว่า startDate ให้ disable ทั้งหมด
            else if (endDateObj < startDateObj) {
                status.isPastStartTime = true
            }
        }

        return status
    }

    // เช็คว่าควรซ่อนเวลานี้หรือไม่
    const shouldHideTime = (status: ReturnType<typeof checkTimeDisableStatus>): boolean => {
        if (status.isDisabledSlot && !showDisabledSlots) return true
        if (status.isPastStartTime && !showPastStartTime) return true
        if (status.isPastTime && !showPastTime) return true
        return false
    }

    // เช็คว่าเวลานี้ disable หรือไม่ (รวมทุกเงื่อนไข)
    const isTimeDisabled = (status: ReturnType<typeof checkTimeDisableStatus>): boolean => {
        return status.isDisabledSlot || status.isPastStartTime || status.isPastTime
    }

    const timeSlots = generateTimeSlots()

    return (
        <div className="relative flex-1">
            {/* ปุ่มเปิด Dropdown */}
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    flex justify-between items-center 
                    w-full h-12 px-3 
                    rounded-xl border border-gray-200 
                    text-[16px] font-[400] 
                    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-gray-400 cursor-pointer'}
                    ${className}
                `}
                type="button"
            >
                <span className={displayValue ? "text-black" : "text-gray-400"}>
                    {displayValue || placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu - แสดงเมื่อ isOpen = true */}
            {isOpen && (
                <>
                    {/* ปิด dropdown เมื่อคลิกข้างนอก */}
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* รายการเวลา */}
                    <div className="absolute mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-40 max-h-60 overflow-y-auto w-full">
                        {timeSlots.filter(time => {
                            const status = checkTimeDisableStatus(time)
                            return !shouldHideTime(status)
                        }).length === 0 ? (
                            <div className="px-4 py-3 text-center text-gray-400 text-[14px]">
                                No available time slots
                            </div>
                        ) : (
                            timeSlots.map((time) => {
                                const status = checkTimeDisableStatus(time)
                                const hide = shouldHideTime(status)
                                const disabled = isTimeDisabled(status)

                                // ถ้าต้องซ่อนเวลานี้
                                if (hide) return null

                                return (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => {
                                            if (disabled) return // ไม่ให้คลิกถ้า disable

                                            const newDate = parseTimeStringToDate(time, date)
                                            onChange(newDate)
                                            setIsOpen(false)
                                        }}
                                        disabled={disabled}
                                        className={`
                                            w-full px-4 py-3 text-left 
                                            text-[14px] font-[500]
                                            ${disabled
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : displayValue === time
                                                    ? 'bg-orange-500 text-white'
                                                    : 'text-gray-900 hover:bg-orange-100 cursor-pointer'
                                            }
                                        `}
                                    >
                                        {time}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    )
}