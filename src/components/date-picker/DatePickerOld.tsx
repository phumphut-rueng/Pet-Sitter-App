import { useState, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate } from "@/utils/date-utili"
import { cn } from "@/lib/utils"
import { getDaysInMonth, getFirstDayOfMonth } from "@/utils/date-utili"
import { DatePickerProps } from "@/types/date-picker.types"

function DatePickerOld({
    date,
    month,
    onMonthChange,
    onSelect,
    disabledDates = [],
    rules = {},
    yearConfig = {},
    width = 400,
    classNameButton,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [pickerView, setPickerView] = useState<'date' | 'month' | 'year'>('date')
    const [yearRangeStart, setYearRangeStart] = useState<number>(0)

    const currentMonth = month || new Date()

    const {
        disablePastDates = false,
        maxMonthsAhead = 0,
        disablePastMonthNavigation = false,
        minDate,
        maxDate
    } = rules

    const {
        startYear = new Date().getFullYear() - 100,
        endYear = new Date().getFullYear(),
        yearsPerPage = 12
    } = yearConfig

    // Cache วันที่วันนี้เพื่อไม่ต้องสร้างใหม่ทุก render
    const today = useMemo(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    }, [])

    // ----- Disabled Dates -----
    const disabledDatesSet = useMemo(() => {
        const set = new Set<string>()
        disabledDates.forEach(d => {
            const normalized = new Date(d)
            normalized.setHours(0, 0, 0, 0)
            set.add(normalized.toISOString())
        })
        return set
    }, [disabledDates])

    // Memoize การคำนวณ calendar grid เพื่อไม่ต้องคำนวณใหม่ทุก render
    const calendarData = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentMonth)
        const firstDay = getFirstDayOfMonth(currentMonth)

        // วันของเดือนก่อนหน้า สำหรับแสดงวันที่ของเดือนก่อนหน้าในตาราง
        const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
        const daysInPrevMonth = prevMonth.getDate()

        // ===== Build Calendar Grid =====
        // สร้าง array ของวันที่ทั้งหมดที่จะแสดงในตาราง (รวมวันของเดือนก่อนและเดือนถัดไป)
        const days: { day: number; isCurrentMonth: boolean }[] = []

        // เพิ่มวันของเดือนที่แล้ว (วันที่จะแสดงสีเทา)
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

        // Split into weeks
        const weeks = []
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7))
        }

        return weeks
    }, [currentMonth])

    // การคำนวณ limits ของเดือน (prev/next disabled)
    const limits = useMemo(() => {
        const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

        let isPrevDisabled = false
        let isNextDisabled = false

        // ตรวจสอบว่าปุ่ม Prev ควร disable หรือไม่
        if (!disablePastMonthNavigation && minDate) {
            const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
            isPrevDisabled = currentMonthStart <= minMonth
        } else if (disablePastMonthNavigation) {
            isPrevDisabled = currentMonthStart <= todayMonth
        }

        // ตรวจสอบว่าปุ่ม Next ควร disable หรือไม่
        if (maxMonthsAhead === 0 && maxDate) {
            const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
            isNextDisabled = currentMonthStart >= maxMonth
        } else if (maxMonthsAhead > 0) {
            const maxMonth = new Date(today)
            maxMonth.setMonth(maxMonth.getMonth() + maxMonthsAhead)
            const limitMonth = new Date(maxMonth.getFullYear(), maxMonth.getMonth(), 1)
            isNextDisabled = currentMonthStart >= limitMonth
        }

        return { isPrevDisabled, isNextDisabled }
    }, [currentMonth, today, disablePastMonthNavigation, minDate, maxMonthsAhead, maxDate])

    const handlePrevMonth = useCallback(() => {
        if (!limits.isPrevDisabled) {
            const newMonth = new Date(currentMonth)
            newMonth.setMonth(newMonth.getMonth() - 1)
            onMonthChange(newMonth)
        }
    }, [currentMonth, limits.isPrevDisabled, onMonthChange])

    // ----- State Checkers -----
    const isSelected = useCallback((day: number) => {
        if (!date) return false
        return date.getDate() === day &&
            date.getMonth() === currentMonth.getMonth() &&
            date.getFullYear() === currentMonth.getFullYear()
    }, [date, currentMonth])

    const isToday = useCallback((day: number) => {
        return today.getDate() === day &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getFullYear() === currentMonth.getFullYear()
    }, [today, currentMonth])

    const isDisabled = useCallback((day: number) => {
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        checkDate.setHours(0, 0, 0, 0)

        if (disablePastDates && checkDate < today) return true
        if (minDate && checkDate < minDate) return true
        if (maxDate && checkDate > maxDate) return true
        if (disabledDatesSet.has(checkDate.toISOString())) return true

        return false
    }, [currentMonth, disablePastDates, today, minDate, maxDate, disabledDatesSet])

    // ----- Handlers -----
    const handleNextMonth = useCallback(() => {
        if (!limits.isNextDisabled) {
            const newMonth = new Date(currentMonth)
            newMonth.setMonth(newMonth.getMonth() + 1)
            onMonthChange(newMonth)
        }
    }, [currentMonth, limits.isNextDisabled, onMonthChange])


    const handleDayClick = useCallback((day: number) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        if (!isDisabled(day) && !isSelected(day)) {
            console.log("selectedDate", selectedDate);
            onSelect(selectedDate)
            setIsOpen(false)
            setPickerView('date')
        }
    }, [currentMonth, isDisabled, isSelected, onSelect])

    const handleMonthSelect = useCallback((monthIndex: number) => {
        const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1)
        onMonthChange(newDate)
        setPickerView('date')
    }, [currentMonth, onMonthChange])

    const handleYearSelect = useCallback((year: number) => {
        const newDate = new Date(year, currentMonth.getMonth(), 1)
        onMonthChange(newDate)
        setPickerView('month')
    }, [currentMonth, onMonthChange])

    // สร้าง array ของปีที่จะแสดงในหน้า year picker (ตาม range ปัจจุบัน)
    const yearRange = useMemo(() => {
        const years = []
        const rangeEnd = Math.min(yearRangeStart + yearsPerPage - 1, endYear)
        for (let i = yearRangeStart; i <= rangeEnd; i++) {
            years.push(i)
        }
        return years
    }, [yearRangeStart, yearsPerPage, endYear])

    const handleYearRangePrev = useCallback(() => {
        const newStart = yearRangeStart - yearsPerPage
        if (newStart >= startYear) {
            setYearRangeStart(newStart)
        }
    }, [yearRangeStart, yearsPerPage, startYear])

    const handleYearRangeNext = useCallback(() => {
        const newStart = yearRangeStart + yearsPerPage
        if (newStart <= endYear) {
            setYearRangeStart(newStart)
        }
    }, [yearRangeStart, yearsPerPage, endYear])

    // เปิด year picker และตั้งค่า range ให้แสดงปีปัจจุบัน
    const openYearPicker = useCallback(() => {
        const currentYear = currentMonth.getFullYear()
        // หา range ที่มีปีปัจจุบันอยู่
        const rangeIndex = Math.floor((currentYear - startYear) / yearsPerPage)
        const calculatedStart = startYear + (rangeIndex * yearsPerPage)
        setYearRangeStart(calculatedStart)
        setPickerView('year')
    }, [currentMonth, startYear, yearsPerPage])

    const handlePopoverOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setPickerView('date')
        }
    }, [])

    // Cache static arrays
    const months = useMemo(() => [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ], [])

    const weekDays = useMemo(() => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], [])

    // สร้าง label แสดง range ของปี เช่น "2000-2011"
    const yearRangeLabel = useMemo(() => {
        const rangeEnd = Math.min(yearRangeStart + yearsPerPage - 1, endYear)
        return `${yearRangeStart}-${rangeEnd}`
    }, [yearRangeStart, yearsPerPage, endYear])

    // ตรวจสอบว่า Prev/Next year range ควร disable หรือไม่
    const isYearRangePrevDisabled = yearRangeStart <= startYear
    const isYearRangeNextDisabled = yearRangeStart + yearsPerPage > endYear

    return (
        <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
            {/* ปุ่มเปิด DatePicker */}
            <PopoverTrigger asChild>
                <button
                    id="date"
                    className={cn(`flex justify-start items-center w-full px-3 
                    rounded-xl border border-gray-2 
                    text-[16px] font-[400] text-black
                    hover:border-gray-4 
                    cursor-pointer`,
                        classNameButton ? classNameButton : "h-12"
                    )}
                >
                    {date
                        ? formatDate(date)
                        : <span className="text-gray-4">Select date</span>}
                </button>
            </PopoverTrigger>

            {/* ปฏิทิน */}
            <PopoverContent
                className="w-auto overflow-hidden p-0 bg-white border border-gray-2 rounded-xl shadow-lg z-70"
                align="start"
            >
                <div
                    style={{ width }}
                    className="p-3 w-full max-w-sm ">
                    {/* ===== Date View - หน้าเลือกวันที่ ===== */}
                    {pickerView === 'date' && (
                        <>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <button
                                    onClick={() => setPickerView('month')}
                                    className="flex items-center gap-1
                                    font-medium text-[14px] text-black
                                    rounded-md  
                                    hover:text-orange-5 px-2 py-1 cursor-pointer"
                                >
                                    {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                                    <ChevronDown className="h-4 w-4" />
                                </button>

                                {/* ปุ่มเลื่อนเดือน */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={handlePrevMonth}
                                        disabled={limits.isPrevDisabled}
                                        className={`p-2 rounded-full
                                            ${limits.isPrevDisabled
                                                ? 'text-gray-4 cursor-not-allowed'
                                                : 'hover:text-orange-5 cursor-pointer'
                                            }`}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={handleNextMonth}
                                        disabled={limits.isNextDisabled}
                                        className={`p-2 rounded-full
                                            ${limits.isNextDisabled
                                                ? 'text-gray-4 cursor-not-allowed'
                                                : ' hover:text-orange-5 cursor-pointer'
                                            }`}
                                    >
                                        <ChevronRight className="h-5 w-5 " />
                                    </button>
                                </div>
                            </div>

                            {/* ตารางปฏิทิน */}
                            <table className="w-full">
                                <thead>
                                    <tr>
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
                                    {/* แสดงวันที่ทั้งหมดในตาราง (แบ่งเป็นสัปดาห์) */}
                                    {calendarData.map((week, weekIndex) => (
                                        <tr key={weekIndex}>
                                            {week.map((dayObj, dayIndex) => {
                                                // Pre-calculate states เพื่อหลีกเลี่ยงการเรียก function หลายครั้งใน className
                                                const disabled = !dayObj.isCurrentMonth || isDisabled(dayObj.day)
                                                const selected = isSelected(dayObj.day)
                                                const today = isToday(dayObj.day)

                                                return (
                                                    <td
                                                        key={dayIndex}
                                                        className="text-center p-1">
                                                        {dayObj && (
                                                            <button
                                                                onClick={() => dayObj.isCurrentMonth && handleDayClick(dayObj.day)}
                                                                disabled={disabled}
                                                                className={`
                                                                    w-9 h-9 rounded-full flex items-center justify-center relative
                                                                    ${!dayObj.isCurrentMonth
                                                                        ? "text-gray-2 cursor-default"
                                                                        : selected
                                                                            ? "bg-orange-5 text-white font-semibold"
                                                                            : today
                                                                                ? "text-orange-5 ring-2 ring-orange-5"
                                                                                : disabled
                                                                                    ? "text-gray-2 cursor-not-allowed"
                                                                                    : "hover:bg-orange-1 text-gray-9 cursor-pointer"
                                                                    }
                                                                `}
                                                            >
                                                                {dayObj.day}
                                                            </button>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* ===== Month View - หน้าเลือกเดือน ===== */}
                    {pickerView === 'month' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <button
                                    onClick={openYearPicker}
                                    className="flex items-center gap-1 px-2 py-1
                                    rounded-md 
                                    font-medium text-[14px] text-black 
                                    hover:text-orange-5 cursor-pointer"
                                >
                                    {currentMonth.getFullYear()}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPickerView('date')}
                                    className="text-[12px] text-gray-5 hover:text-orange-5 cursor-pointer"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Grid แสดงเดือนทั้งหมด (3 คอลัมน์) */}
                            <div className="grid grid-cols-3 gap-2">
                                {months.map((monthName, index) => (
                                    <button
                                        key={monthName}
                                        onClick={() => handleMonthSelect(index)}
                                        className={`p-3 text-sm rounded-md cursor-pointer
                                            ${index === currentMonth.getMonth()
                                                ? 'bg-orange-5 text-white'
                                                : 'hover:bg-orange-1 text-gray-9'
                                            }`}
                                    >
                                        {monthName.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== Year View - หน้าเลือกปี ===== */}
                    {pickerView === 'year' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleYearRangePrev}
                                        disabled={isYearRangePrevDisabled}
                                        className={`p-1 rounded-full ${isYearRangePrevDisabled
                                            ? 'text-gray-4 cursor-not-allowed'
                                            : 'hover:text-orange-5 cursor-pointer'
                                            }`}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <h4 className="font-medium text-[14px] min-w-[80px] text-center">
                                        {yearRangeLabel}
                                    </h4>
                                    <button
                                        onClick={handleYearRangeNext}
                                        disabled={isYearRangeNextDisabled}
                                        className={`p-1 rounded-full ${isYearRangeNextDisabled
                                            ? 'text-gray-4 cursor-not-allowed'
                                            : 'hover:text-orange-5 cursor-pointer'
                                            }`}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setPickerView('month')}
                                    className="text-[12px] text-gray-5 hover:text-orange-5 cursor-pointer"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Grid แสดงปีทั้งหมด (4 คอลัมน์) */}
                            <div className="grid grid-cols-4 gap-4">
                                {yearRange.map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => handleYearSelect(year)}
                                        className={`p-3 text-sm rounded-md cursor-pointer
                                            ${year === currentMonth.getFullYear()
                                                ? 'bg-orange-5 text-white'
                                                : 'hover:bg-orange-1 text-gray-9'
                                            }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default DatePickerOld