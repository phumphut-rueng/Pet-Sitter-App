import { ChevronLeft, ChevronDown } from "lucide-react"
import { useCallback, useMemo } from "react"
import { MonthProps } from "@/types/date-picker.types"

export default function MonthPicker({
    currentMonth,
    openYearPicker,
    onMonthSelect,
    setView,
    rules = {},
}: MonthProps) {
    const months = useMemo(
        () => [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        []
    )
    const {
        disablePastDates = false
    } = rules

    const handleMonthSelect = useCallback(
        (monthIndex: number) => {
            onMonthSelect(new Date(currentMonth.getFullYear(), monthIndex, 1))
            setView("date")
        },
        [onMonthSelect, setView, currentMonth]
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <button
                    onClick={openYearPicker}
                    className="flex items-center gap-1 px-2 py-1 
                    rounded-md 
                    font-medium text-[14px] text-black 
                    hover:text-orange-5 
                    cursor-pointer"
                >
                    {currentMonth.getFullYear()}
                    <ChevronDown className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setView("date")}
                    className="text-[12px] text-gray-5 
                    hover:text-orange-5 
                    cursor-pointer"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </div>

            {/* Grid แสดงเดือนทั้งหมด (3 คอลัมน์) */}
            <div className="grid grid-cols-3 gap-2">
                {months.map((m, idx) => {

                    const isCurrentYear = currentMonth.getFullYear() === new Date().getFullYear()
                    const isPastMonth = disablePastDates &&
                        isCurrentYear && idx < new Date().getMonth()

                    return (
                        <button
                            key={m}
                            onClick={() => {
                                if (!isPastMonth) {
                                    handleMonthSelect(idx)
                                }
                            }}
                            className={`p-3 text-sm rounded-md
                                ${idx === currentMonth.getMonth()
                                    ? "bg-orange-5 text-white"
                                    : isPastMonth
                                        ? "text-gray-4 cursor-not-allowed"
                                        : "hover:bg-orange-1 text-gray-9 cursor-pointer"
                                }`
                            }
                        >
                            {m.substring(0, 3)}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
