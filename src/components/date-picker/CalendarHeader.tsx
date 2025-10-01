import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { useCallback, useMemo } from "react"
import { CalendarHeaderProps } from "@/types/date-picker.types"
import { NavigationButton } from "../buttons/NavigationButton"

export default function CalendarHeader({
    currentMonth,
    onMonthChange,
    setView,
    rules
}: CalendarHeaderProps) {
    const { disablePastDates, minDate, maxDate, today } = rules

    const startOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), 1)

    const todayMonth = useMemo(() => startOfMonth(today), [today])
    const currentMonthStart = useMemo(
        () => startOfMonth(currentMonth),
        [currentMonth]
    )

    const isPrevDisabled = useMemo(() => {
        if (!disablePastDates && minDate) {
            return currentMonthStart <= startOfMonth(minDate)
        } else if (disablePastDates) {
            return currentMonthStart <= todayMonth
        }
        return false
    }, [disablePastDates, minDate, currentMonthStart, todayMonth])

    const isNextDisabled = useMemo(() => {
        console.log("maxDate", maxDate, currentMonthStart);

        if (maxDate) {
            return currentMonthStart >= startOfMonth(maxDate)
        }
        return false
    }, [maxDate, currentMonthStart])

    const handleMonthChange = useCallback((offset: number) => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + offset)
        onMonthChange(newMonth)
    }, [currentMonth, onMonthChange])

    return (
        <div className="flex items-center justify-between mb-4 px-2">
            {/* Month-Year Selector */}
            <button
                onClick={() => setView('month')}
                className="flex items-center gap-1 
                font-medium text-[14px] text-black 
                rounded-md 
                hover:text-orange-5 px-2 py-1 
                cursor-pointer"
            >
                {
                    currentMonth.toLocaleString(
                        "default",
                        {
                            month: "long",
                            year: "numeric"
                        })
                }
                <ChevronDown className="h-4 w-4" />
            </button>
            <div className="flex gap-1">
                <NavigationButton
                    onClick={() => handleMonthChange(-1)}
                    disabled={isPrevDisabled}
                    icon={<ChevronLeft className="h-5 w-5" />}
                />
                <NavigationButton
                    onClick={() => handleMonthChange(1)}
                    disabled={isNextDisabled}
                    icon={<ChevronRight className="h-5 w-5" />}
                />
            </div>
        </div>
    )
}
