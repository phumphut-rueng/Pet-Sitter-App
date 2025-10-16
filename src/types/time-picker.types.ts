export interface TimePickerProps {
    value: Date | undefined //เวลาที่เลือกปัจจุบัน (Date object)
    onChange: (date: Date) => void //Function ที่เรียกเมื่อเลือกเวลาใหม่ (ส่ง Date กลับ)
    placeholder?: string //ข้อความแสดงเมื่อยังไม่ได้เลือกเวลา
    className?: string //CSS class เพิ่มเติมสำหรับปุ่ม
    date?: Date //วันที่ทำการเลือกอยู่
    disabled?: boolean //ปิดการใช้งาน TimePicker
    startDate?: Date //วันที่เริ่มต้น (สำหรับ endDate picker เช็คว่าต้องมากกว่า startDate)
    startTimeValue?: Date | null //เวลาเริ่มต้นที่เลือก (สำหรับเช็คว่า end ต้องมากกว่า start)
    disabledTimeSlots?: DisabledTimeRange[] //รายการเวลาที่ต้องการ disable (Array ของ Date objects)

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


export interface DisabledTimeRange {
    date_start: Date | string  // รองรับ TIMESTAMP จาก DB
    date_end: Date | string
}