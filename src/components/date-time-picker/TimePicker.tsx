import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface TimePickerProps {
    value: string
    onChange: (time: string) => void
    placeholder?: string
    className?: string
}

/**
 * TimePicker Component
 * 
 * Component สำหรับเลือกเวลา แสดงเป็น dropdown ที่มีช่วงเวลาให้เลือก
 * 
 * @param value - ค่าเวลาที่เลือกปัจจุบัน (เช่น "8:30 AM")
 * @param onChange - Function ที่เรียกเมื่อเลือกเวลาใหม่
 * @param placeholder - ข้อความแสดงเมื่อยังไม่ได้เลือกเวลา
 * @param className - CSS class เพิ่มเติมสำหรับปุ่ม
 * 
 * การทำงาน:
 * 1. สร้างรายการเวลาทุก 30 นาที จาก 8:00 AM ถึง 6:00 PM
 * 2. แสดงเป็น dropdown เมื่อคลิกปุ่ม
 * 3. เมื่อเลือกเวลา จะส่งค่ากลับผ่าน onChange และปิด dropdown อัตโนมัติ
 */
function TimePicker({
    value,
    onChange,
    placeholder = "Select time",
    className = ""
}: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    /**
     * สร้างรายการช่วงเวลาทุก 30 นาที
     * เริ่มจาก 8:00 AM ถึง 6:00 PM
     * 
     * @returns Array ของเวลาในรูปแบบ "H:MM AM/PM"
     */
    const generateTimeSlots = () => {
        const times: string[] = []

        // Loop ชั่วโมงจาก 8 ถึง 18 (6 PM)
        for (let hour = 8; hour <= 18; hour++) {
            // Loop นาทีทุก 30 นาที (0, 30)
            for (let minute = 0; minute < 60; minute += 30) {
                // หยุดที่ 6:00 PM (ไม่เอา 6:30 PM)
                if (hour === 18 && minute > 0) break

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

    const timeSlots = generateTimeSlots()

    return (
        <div className="relative flex-1">
            {/* ปุ่มเปิด Dropdown */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex justify-between items-center 
                    w-full h-12 px-3 
                    rounded-xl border border-gray-2 
                    text-[16px] font-[400] 
                    hover:border-gray-4
                    cursor-pointer
                    ${className}
                `}
                type="button"
            >
                <span className={value ? "text-black" : "text-gray-4"}>
                    {value || placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                    <div className="absolute mt-2 bg-white border border-gray-2 rounded-xl shadow-lg z-40 max-h-60 overflow-y-auto">
                        {timeSlots.map((time) => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => {
                                    onChange(time)
                                    setIsOpen(false)
                                }}
                                className={`
                                    w-full px-4 py-3 text-left 
                                    text-[14px] font-[500]
                                    ${value === time
                                        ? 'bg-orange-5 text-white '
                                        : 'text-gray-9 hover:bg-orange-1 cursor-pointer'
                                    }
                                `}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default TimePicker