export interface DatePickerProps {
    date: Date | undefined // วันที่ที่เลือกไว้
    month: Date | undefined // เดือนที่กำลังแสดงในปฏิทิน
    onMonthChange: (month: Date | undefined) => void // callback เมื่อเปลี่ยนเดือน
    onSelect: (date?: Date) => void // callback เมื่อเลือกวันที่
    disabledDates?: Date[] // array ของวันที่ที่ต้องการ disable
    width?: number // ความกว้างของ calendar
    classNameButton?: string

    rules?: {
        disablePastDates?: boolean // ไม่สามารถเลือกวันที่ในอดีตได้ (default: false)
        maxMonthsAhead?: number // จำนวนเดือนไม่เกินกี่เดือนนับจากเดือนจากปัจจุบัน (default: 0)
        disablePastMonthNavigation?: boolean // ไม่สามารถย้อนกลับไปเดือนที่แล้วได้ (default: false)
        minDate?: Date // วันที่เริ่มต้นที่เลือกได้
        maxDate?: Date // วันที่สุดท้ายที่เลือกได้
    }

    yearConfig?: {
        startYear?: number // ปีเริ่มต้น (default: current year - 100)
        endYear?: number // ปีสิ้นสุด (default: current year)
        yearsPerPage?: number // จำนวนปีต่อหน้า (default: 12)
    }
}