import { ChevronLeft, ChevronRight } from "lucide-react"

interface BookingCalendarProps {
    date: Date | undefined
    month: Date | undefined
    onMonthChange: (month: Date | undefined) => void
    onSelect: (date?: Date) => void
    disabledDates?: Date[] //วันที่ต้องการ disable
}

function BookingCalendar({
    date,
    month,
    onMonthChange,
    onSelect,
    disabledDates = [],
}: BookingCalendarProps) {
    const currentMonth = month || new Date()

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        return new Date(year, month, 1).getDay()
    }

    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // หาวันสุดท้ายของเดือนที่แล้ว
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
    const daysInPrevMonth = prevMonth.getDate()

    const days = []
    // เพิ่มวันของเดือนที่แล้ม
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, isCurrentMonth: false })
    }
    // เพิ่มวันของเดือนปัจจุบัน
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true })
    }
    // เพิ่มวันของเดือนถัดไป (เติมให้ครบสัปดาห์)
    const remainingInWeek = 7 - (days.length % 7)
    if (remainingInWeek < 7) {
        for (let i = 1; i <= remainingInWeek; i++) {
            days.push({ day: i, isCurrentMonth: false })
        }
    }

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7))
    }

    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() - 1)

        // ไม่ให้ไปเดือนก่อนเดือนปัจจุบัน
        const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const targetMonth = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1)

        if (targetMonth >= todayMonth) {
            onMonthChange(newMonth)
        }
    }

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + 1)

        // ไม่ให้ไปเกิน 10 เดือนจากวันนี้
        const maxMonth = new Date(today)
        maxMonth.setMonth(maxMonth.getMonth() + 10)
        const targetMonth = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1)
        const limitMonth = new Date(maxMonth.getFullYear(), maxMonth.getMonth(), 1)

        if (targetMonth <= limitMonth) {
            onMonthChange(newMonth)
        }
    }

    // set Disabled ตามที่เช็ต
    const isPrevDisabled = () => {
        const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        return currentMonthStart <= todayMonth
    }

    // set Disabled ตามที่เช็ต
    const isNextDisabled = () => {
        const maxMonth = new Date(today)
        maxMonth.setMonth(maxMonth.getMonth() + 10)
        const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const limitMonth = new Date(maxMonth.getFullYear(), maxMonth.getMonth(), 1)
        return currentMonthStart >= limitMonth
    }

    const handleDayClick = (day: number) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        // เลือกได้เฉพาะวันที่ไม่ disabled
        if (!isDisabled(day)) {
            onSelect(selectedDate)
        }
    }

    const isSelected = (day: number) => {
        if (!date) return false
        return date.getDate() === day &&
            date.getMonth() === currentMonth.getMonth() &&
            date.getFullYear() === currentMonth.getFullYear()
    }

    const isToday = (day: number) => {
        return today.getDate() === day &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getFullYear() === currentMonth.getFullYear()
    }

    const isInDisabledList = (day: number) => {
        return disabledDates.some(disabledDate => {
            const d = new Date(disabledDate)
            d.setHours(0, 0, 0, 0)
            return d.getDate() === day &&
                d.getMonth() === currentMonth.getMonth() &&
                d.getFullYear() === currentMonth.getFullYear()
        })
    }

    const isDisabled = (day: number) => {
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        checkDate.setHours(0, 0, 0, 0)
        // Disable ถ้าเป็นวันในอดีต หรืออยู่ใน disabledDates
        return checkDate < today || isInDisabledList(day)
    }

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    return (
        <div className="p-3 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4 px-2">
                {/* Month Text */}
                <span className="font-medium text-[14px] text-black">
                    {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                </span>

                <div className="flex gap-1">
                    {/* Prev Month */}
                    <button
                        onClick={handlePrevMonth}
                        disabled={isPrevDisabled()}
                        className={`p-2 rounded-full
                            ${isPrevDisabled()
                                ? 'text-gray-4 cursor-not-allowed'
                                : 'hover:bg-orange-1 cursor-pointer'
                            }`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Next Month */}
                    <button
                        onClick={handleNextMonth}
                        disabled={isNextDisabled()}
                        className={`p-2 rounded-full
                            ${isNextDisabled()
                                ? 'text-gray-4 cursor-not-allowed'
                                : 'hover:bg-orange-1 cursor-pointer'
                            }`}
                    >
                        <ChevronRight className="h-5 w-5 " />
                    </button>
                </div>
            </div>

            <table className="w-full">
                <thead>
                    <tr>
                        {/* Week Text */}
                        {weekDays.map(day => (
                            <th
                                key={day}
                                className="font-normal text-gray-5 pb-2">
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Date */}
                    {weeks.map((week, weekIndex) => (
                        <tr key={weekIndex}>
                            {week.map((dayObj, dayIndex) => (
                                <td
                                    key={dayIndex}
                                    className="text-center p-1">
                                    {dayObj && (
                                        <button
                                            onClick={() => dayObj.isCurrentMonth && handleDayClick(dayObj.day)}
                                            disabled={!dayObj.isCurrentMonth || isDisabled(dayObj.day)}
                                            className={`
                                                w-9 h-9 rounded-full flex items-center justify-center relative
                                                ${!dayObj.isCurrentMonth
                                                    ? "text-gray-2 cursor-default"
                                                    : isSelected(dayObj.day)
                                                        ? "bg-orange-5 text-white font-semibold"
                                                        : isToday(dayObj.day)
                                                            ? "text-orange-5 ring-2 ring-orange-5"
                                                            : isDisabled(dayObj.day)
                                                                ? "text-gray-2 cursor-not-allowed"
                                                                : "hover:bg-orange-1 text-gray-9 cursor-pointer"
                                                }
                                            `}
                                        >
                                            {dayObj.day}
                                        </button>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    )
}

export default BookingCalendar