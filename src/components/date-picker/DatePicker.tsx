import { useState, useMemo, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/utils/date-utili"
import { cn } from "@/lib/utils"
import { getDaysInMonth, getFirstDayOfMonth } from "@/utils/date-utili"
import { DatePickerProps } from "@/types/date-picker.types"
import CalendarHeader from "./CalendarHeader"
import CalendarTable from "./CalendarTable"
import MonthPicker from "./MonthPicker"
import YearPicker from "./YearPicker"

function DatePicker({
    date,
    month,
    onMonthChange,
    onSelect,
    disabledDatesSlots = [],
    rules = {},
    width = 400,
    classNameButton,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [pickerView, setPickerView] = useState<"date" | "month" | "year">("date")
    const [yearRangeStart, setYearRangeStart] = useState<number>(0)
    const currentMonth = useMemo(() => {
        return month || new Date()
    }, [month])

    const {
        disablePastDates,
        minDate,
        maxDate,
    } = rules

    // ถ้า minDate ถูกส่งเข้ามา ให้ disablePastDates = false
    const newDisablePastDates =
        (minDate !== undefined) ? false : disablePastDates;

    const newMinDate = minDate ?? (
        newDisablePastDates
            ? new Date()
            : (() => {
                const d = new Date()
                d.setFullYear(d.getFullYear() - 100)
                return d
            })()
    )

    const newMaxDate = maxDate ?? (
        newDisablePastDates
            ? (() => {
                const d = new Date()
                d.setFullYear(d.getFullYear() + 11)
                return d
            })()
            : new Date()
    )

    console.log("new\n", newMinDate, "\n", newMaxDate, new Date());


    console.log("newDisable\n", newDisablePastDates, newMinDate, newMinDate.getFullYear());
    const startYear = newMinDate.getFullYear()
    const endYear = newMaxDate.getFullYear()
    const yearsPerPage = 12
    console.log("Year\n", startYear, endYear, yearsPerPage, newMaxDate, newMaxDate.getFullYear());

    const today = useMemo(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    }, [])

    const disabledDatesSet = useMemo(() => {
        const set = new Set<string>()
        disabledDatesSlots.forEach((d) => {
            const normalized = new Date(d)
            normalized.setHours(0, 0, 0, 0)
            set.add(normalized.toISOString())
        })
        return set
    }, [disabledDatesSlots])

    // --- Calendar data ---
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

    // --- Utils checkers ---
    const isSelected = useCallback(
        (day: number) =>
            !!date &&
            date.getDate() === day &&
            date.getMonth() === currentMonth.getMonth() &&
            date.getFullYear() === currentMonth.getFullYear(),
        [date, currentMonth]
    )

    const isToday = useCallback(
        (day: number) =>
            today.getDate() === day &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getFullYear() === currentMonth.getFullYear(),
        [today, currentMonth]
    )

    const isDisabled = useCallback(
        (day: number) => {
            const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            checkDate.setHours(0, 0, 0, 0)
            if (newDisablePastDates && checkDate < today) return true
            if (minDate && checkDate < minDate) return true
            if (maxDate && checkDate > maxDate) return true
            if (disabledDatesSet.has(checkDate.toISOString())) return true
            return false
        },
        [currentMonth, newDisablePastDates, today, minDate, maxDate, disabledDatesSet]
    )

    const openYearPicker = useCallback(() => {
        const currentYear = currentMonth.getFullYear()
        // หา range ที่มีปีปัจจุบันอยู่
        const rangeIndex = Math.floor((currentYear - startYear) / yearsPerPage)
        const calculatedStart = startYear + (rangeIndex * yearsPerPage)
        setYearRangeStart(calculatedStart)
        setPickerView('year')
    }, [currentMonth, startYear, yearsPerPage])

    return (
        <Popover open={isOpen} onOpenChange={(o) => setIsOpen(o)}>
            <PopoverTrigger asChild>
                <button
                    id="date"
                    className={cn(
                        `flex justify-start items-center w-full px-3 
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

            <PopoverContent
                className="w-auto overflow-hidden p-0 bg-white border border-gray-2 rounded-xl shadow-lg z-70"
                align="start"
            >
                <div
                    style={{ width }}
                    className="p-3 w-full max-w-sm ">
                    {pickerView === "date" && (
                        <>
                            <CalendarHeader
                                setView={setPickerView}
                                currentMonth={currentMonth}
                                onMonthChange={onMonthChange}
                                rules={{
                                    disablePastDates: newDisablePastDates,
                                    minDate,
                                    maxDate,
                                    today
                                }}
                            />
                            <CalendarTable
                                weeks={calendarData}
                                isDisabled={isDisabled}
                                isSelected={isSelected}
                                isToday={isToday}
                                onDayClick={(day) => {
                                    const selectedDate = new Date(
                                        currentMonth.getFullYear(),
                                        currentMonth.getMonth(),
                                        day
                                    )
                                    if (!isDisabled(day)) {
                                        onSelect(selectedDate)
                                        setIsOpen(false)
                                    }
                                }}
                            />
                        </>
                    )}

                    {pickerView === "month" && (
                        <MonthPicker
                            currentMonth={currentMonth}
                            openYearPicker={openYearPicker}
                            onMonthSelect={onMonthChange}
                            setView={setPickerView}
                            rules={{
                                disablePastDates: newDisablePastDates
                            }}
                        />
                    )}

                    {pickerView === "year" && (
                        <YearPicker
                            currentMonth={currentMonth}
                            onYearSelect={onMonthChange}
                            yearRangeStart={yearRangeStart}
                            setYearRangeStart={setYearRangeStart}
                            setView={setPickerView}
                            yearConfig={{
                                startYear,
                                endYear,
                                yearsPerPage
                            }}
                        />
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default DatePicker
