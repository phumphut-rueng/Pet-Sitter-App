import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate } from "@/utils/formatDate"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    date: Date | undefined // วันที่ที่เลือกไว้
    month: Date | undefined // เดือนที่กำลังแสดงในปฏิทิน
    onMonthChange: (month: Date | undefined) => void // callback เมื่อเปลี่ยนเดือน
    onSelect: (date?: Date) => void // callback เมื่อเลือกวันที่
    disabledDates?: Date[] // array ของวันที่ที่ต้องการ disable
    width?: number

    rules?: {
        disablePastDates?: boolean // ไม่สามารถเลือกวันที่ในอดีตได้ (default: true)
        maxMonthsAhead?: number // จำนวนเดือนไม่เกิดกี่เดือนนับจากเดือนจากปัจจุบัน (default: 10)
        disablePastMonthNavigation?: boolean // ไม่สามารถย้อนกลับไปเดือนที่แล้วได้ (default: true)
        minDate?: Date // วันที่เริ่มต้นที่เลือกได้
        maxDate?: Date // วันที่สุดท้ายที่เลือกได้
    }

    yearConfig?: {
        startYear?: number // ปีเริ่มต้น (default: current year - 100)
        endYear?: number // ปีสิ้นสุด (default: current year)
        yearsPerPage?: number // จำนวนปีต่อหน้า (default: 12)
    }
}

function DatePicker({
    date,
    month,
    onMonthChange,
    onSelect,
    disabledDates = [],
    rules = {},
    yearConfig = {},
    width = 400
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [pickerView, setPickerView] = useState<'date' | 'month' | 'year'>('date')
    const [yearRangeStart, setYearRangeStart] = useState<number>(0)
    const currentMonth = month || new Date()

    const {
        disablePastDates = true,
        maxMonthsAhead = 10,
        disablePastMonthNavigation = true,
        minDate,
        maxDate
    } = rules

    const {
        startYear = new Date().getFullYear() - 100,
        endYear = new Date().getFullYear(),
        yearsPerPage = 12
    } = yearConfig

    // หาจำนวนวันในเดือน
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        return new Date(year, month + 1, 0).getDate()
    }

    // หาว่าวันแรกของเดือนตรงกับวันอะไรในสัปดาห์
    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        return new Date(year, month, 1).getDay()
    }

    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // หาข้อมูลเดือนก่อนหน้า สำหรับแสดงวันที่ของเดือนก่อนหน้าในตาราง
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
    const daysInPrevMonth = prevMonth.getDate()

    // ===== Build Calendar Grid =====
    // สร้าง array ของวันที่ทั้งหมดที่จะแสดงในตาราง (รวมวันของเดือนก่อนและเดือนถัดไป)
    const days = []
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

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7))
    }

    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() - 1)

        if (!isPrevDisabled()) {
            onMonthChange(newMonth)
        }
    }

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + 1)

        if (!isNextDisabled()) {
            onMonthChange(newMonth)
        }
    }

    //ตรวจสอบว่าปุ่ม Prev ควร disable หรือไม่
    const isPrevDisabled = () => {
        if (!disablePastMonthNavigation && minDate) {
            const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
            const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
            return currentMonthStart <= minMonth
        }

        if (disablePastMonthNavigation) {
            const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
            return currentMonthStart <= todayMonth
        }

        return false
    }

    //ตรวจสอบว่าปุ่ม Next ควร disable หรือไม่
    const isNextDisabled = () => {
        if (maxMonthsAhead === 0 && maxDate) {
            const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
            const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
            return currentMonthStart >= maxMonth
        }

        if (maxMonthsAhead > 0) {
            const maxMonth = new Date(today)
            maxMonth.setMonth(maxMonth.getMonth() + maxMonthsAhead)
            const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
            const limitMonth = new Date(maxMonth.getFullYear(), maxMonth.getMonth(), 1)
            return currentMonthStart >= limitMonth
        }

        return false
    }

    const handleDayClick = (day: number) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        if (!isDisabled(day) && !isSelected(day)) {
            onSelect(selectedDate)
            setIsOpen(false)
            setPickerView('date')
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

        let disabled = false

        if (disablePastDates && checkDate < today) {
            disabled = true
        }

        if (minDate && checkDate < minDate) {
            disabled = true
        }

        if (maxDate && checkDate > maxDate) {
            disabled = true
        }

        if (isInDisabledList(day)) {
            disabled = true
        }

        return disabled
    }

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1)
        onMonthChange(newDate)
        setPickerView('date')
    }

    const handleYearSelect = (year: number) => {
        const newDate = new Date(year, currentMonth.getMonth(), 1)
        onMonthChange(newDate)
        setPickerView('month')
    }

    //สร้าง array ของปีที่จะแสดงในหน้า year picker (ตาม range ปัจจุบัน)
    const generateYearRange = () => {
        const years = []
        const rangeEnd = Math.min(yearRangeStart + yearsPerPage - 1, endYear)

        for (let i = yearRangeStart; i <= rangeEnd; i++) {
            years.push(i)
        }
        return years
    }

    const handleYearRangePrev = () => {
        const newStart = yearRangeStart - yearsPerPage
        if (newStart >= startYear) {
            setYearRangeStart(newStart)
        }
    }

    const handleYearRangeNext = () => {
        const newStart = yearRangeStart + yearsPerPage
        if (newStart <= endYear) {
            setYearRangeStart(newStart)
        }
    }

    //ตรวจสอบว่า Prev year range ควร disable หรือไม่
    const isYearRangePrevDisabled = () => {
        return yearRangeStart <= startYear
    }

    //ตรวจสอบว่า Next year range ควร disable หรือไม่
    const isYearRangeNextDisabled = () => {
        return yearRangeStart + yearsPerPage > endYear
    }

    //สร้าง label แสดง range ของปี เช่น "2000-2011"
    const getYearRangeLabel = () => {
        const rangeEnd = Math.min(yearRangeStart + yearsPerPage - 1, endYear)
        return `${yearRangeStart}-${rangeEnd}`
    }

    //เปิด year picker และตั้งค่า range ให้แสดงปีปัจจุบัน
    const openYearPicker = () => {
        const currentYear = currentMonth.getFullYear()
        // หา range ที่มีปีปัจจุบันอยู่
        const rangeIndex = Math.floor((currentYear - startYear) / yearsPerPage)
        const calculatedStart = startYear + (rangeIndex * yearsPerPage)
        setYearRangeStart(calculatedStart)
        setPickerView('year')
    }

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    const handlePopoverOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setPickerView('date')
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
            {/* ปุ่มเปิด DatePicker */}
            <PopoverTrigger asChild>
                <button
                    id="date"
                    className="flex justify-start items-center w-full h-12 px-3 
                    rounded-xl border border-gray-2 
                    text-[16px] font-[400] text-black
                    hover:border-gray-4 
                    cursor-pointer"
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
                                        disabled={isPrevDisabled()}
                                        className={`p-2 rounded-full
                                            ${isPrevDisabled()
                                                ? 'text-gray-4 cursor-not-allowed'
                                                : 'hover:text-orange-5 cursor-pointer'
                                            }`}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={handleNextMonth}
                                        disabled={isNextDisabled()}
                                        className={`p-2 rounded-full
                                            ${isNextDisabled()
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
                        </>
                    )}

                    {/* ===== Month View - หน้าเลือกเดือน ===== */}
                    {pickerView === 'month' && (
                        <div className="space-y-4">
                            <div
                                className="flex items-center justify-between px-2">
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
                                        disabled={isYearRangePrevDisabled()}
                                        className={`p-1 rounded-full ${isYearRangePrevDisabled()
                                            ? 'text-gray-4 cursor-not-allowed'
                                            : 'hover:text-orange-5 cursor-pointer'
                                            }`}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <h4 className="font-medium text-[14px] min-w-[80px] text-center">
                                        {getYearRangeLabel()}
                                    </h4>
                                    <button
                                        onClick={handleYearRangeNext}
                                        disabled={isYearRangeNextDisabled()}
                                        className={`p-1 rounded-full ${isYearRangeNextDisabled()
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
                                {generateYearRange().map((year) => (
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

export default DatePicker