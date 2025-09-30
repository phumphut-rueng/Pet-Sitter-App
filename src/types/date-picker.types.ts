export interface DatePickerProps {
    date: Date | undefined // วันที่ที่เลือกไว้
    month: Date | undefined // เดือนที่กำลังแสดงในปฏิทิน
    onMonthChange: (month: Date | undefined) => void // callback เมื่อเปลี่ยนเดือน
    onSelect: (date?: Date) => void // callback เมื่อเลือกวันที่
    disabledDatesSlots?: Date[] // array ของวันที่ที่ต้องการ disable
    width?: number // ความกว้างของ calendar
    classNameButton?: string

    rules?: {
        disablePastDates?: boolean //ไม่สามารถเลือกวันที่ในอดีตได้ (true = เลือกไม่ได้, false = เลือกได้)
        minDate?: Date // วันที่เริ่มต้นที่เลือกได้ (default: 100 ก่อน) ถ้าส่งค่า minDate ไป disablePastDates จะไม่ทำงาน
        maxDate?: Date // วันที่สุดท้ายที่เลือกได้
    }
}

export interface MonthProps {
    currentMonth: Date //วันที่ที่เลือกไว้
    openYearPicker: () => void //callback เมือเลือกปี
    onMonthSelect: (d: Date) => void //callback เมือเลือกเดือน
    setView: (v: "date" | "month" | "year") => void //เปลี่ยนหน้าที่แสดง
    rules?: {
        disablePastDates?: boolean //ไม่สามารถเลือกวันที่ในอดีตได้ (true = เลือกไม่ได้, false = เลือกได้)
    }
}

export interface YearProps {
    currentMonth: Date //วันที่ที่เลือกไว้
    onYearSelect: (d: Date) => void //ปีที่ที่เลือกไว้
    yearRangeStart: number //ลืมคิดแปป
    setYearRangeStart: React.Dispatch<React.SetStateAction<number>> //callback เมือเลือกปี
    setView: (v: "date" | "month" | "year") => void //เปลี่ยนหน้าที่แสดง
    yearConfig: {
        startYear: number; //ปีที่เริ่ม
        endYear: number; //ปีที่สิ้นสุด
        yearsPerPage: number, //จำนวนปีต่อหน้า
    }
}