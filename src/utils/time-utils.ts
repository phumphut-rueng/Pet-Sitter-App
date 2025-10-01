// utils/time-utils.ts ฟังก์ชันเกี่ยวกับเวลา เช่น format, parse, compare

// แปลง Date → "8:30 AM"
export const formatDateToTimeString = (date: Date | undefined): string => {
    if (!date) return ""
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    const period = hours >= 12 ? "PM" : "AM"
    return `${h}:${minutes.toString().padStart(2, "0")} ${period}`
}

// แปลง "8:30 AM" → Date
export const parseTimeStringToDate = (timeStr: string, baseDate?: Date): Date => {
    const [time, period] = timeStr.split(" ")
    const [hours, minutes] = time.split(":").map(Number)
    let hour24 = hours
    if (period === "PM" && hours !== 12) hour24 = hours + 12
    if (period === "AM" && hours === 12) hour24 = 0

    const newDate = baseDate ? new Date(baseDate) : new Date()
    newDate.setHours(hour24, minutes, 0, 0)
    return newDate
}

// เวลา (string) → นาที
export const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(" ")
    const [hours, minutes] = time.split(":").map(Number)
    let hour24 = hours
    if (period === "PM" && hours !== 12) hour24 = hours + 12
    if (period === "AM" && hours === 12) hour24 = 0
    return hour24 * 60 + minutes
}

// Date → นาที
export const dateToMinutes = (date: Date): number =>
    date.getHours() * 60 + date.getMinutes()

// สร้างรายการช่วงเวลา
export const generateTimeSlots = (startTime = 8, endTime = 23, interval: 30 | 60 = 30): string[] => {
    const times: string[] = []
    for (let hour = startTime; hour <= endTime; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            if (hour === endTime && minute > 0) break
            const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
            const period = hour >= 12 ? "PM" : "AM"
            times.push(`${h}:${minute.toString().padStart(2, "0")} ${period}`)
        }
    }
    return times
}

export interface TimeStatus {
    isDisabledSlot: boolean
    isPastStartTime: boolean
    isPastTime: boolean
}