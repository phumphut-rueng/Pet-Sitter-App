import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface Props {
    currentMonth: Date
    onMonthChange: (d: Date) => void
    setView: (v: "date" | "month" | "year") => void
    rules: {
        disablePastDates?: boolean
        minDate?: Date
        maxDate?: Date
        maxMonthsAhead?: number
        today: Date
    }
}

export default function CalendarHeader({
    currentMonth,
    onMonthChange,
    setView,
    rules
}: Props) {
    const { disablePastDates, minDate, maxDate, maxMonthsAhead, today } = rules

    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

    let isPrevDisabled = false
    let isNextDisabled = false

    if (!disablePastDates && minDate) {
        const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
        isPrevDisabled = currentMonthStart <= minMonth
    } else if (disablePastDates) {
        isPrevDisabled = currentMonthStart <= todayMonth
    }

    if (maxMonthsAhead === 0 && maxDate) {
        const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
        isNextDisabled = currentMonthStart >= maxMonth
    } else if (maxMonthsAhead && maxMonthsAhead > 0) {
        const maxMonth = new Date(today)
        maxMonth.setMonth(maxMonth.getMonth() + maxMonthsAhead)
        const limitMonth = new Date(maxMonth.getFullYear(), maxMonth.getMonth(), 1)
        isNextDisabled = currentMonthStart >= limitMonth
    }

    return (
        <div className="flex items-center justify-between mb-4 px-2">
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
                <button
                    onClick={() => {
                        const newMonth = new Date(currentMonth)
                        newMonth.setMonth(newMonth.getMonth() - 1)
                        onMonthChange(newMonth)
                    }}
                    disabled={isPrevDisabled}
                    className={`p-2 rounded-full 
                        ${isPrevDisabled
                            ? "text-gray-4 cursor-not-allowed"
                            : "hover:text-orange-5 cursor-pointer"
                        }`}
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={() => {
                        const newMonth = new Date(currentMonth)
                        newMonth.setMonth(newMonth.getMonth() + 1)
                        onMonthChange(newMonth)
                    }}
                    disabled={isNextDisabled}
                    className={`p-2 rounded-full 
                        ${isNextDisabled
                            ? "text-gray-4 cursor-not-allowed"
                            : "hover:text-orange-5 cursor-pointer"
                        }`}
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}
