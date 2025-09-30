import { ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
    currentMonth: Date
    onYearSelect: (d: Date) => void
    yearRangeStart: number
    setYearRangeStart: (n: number) => void
    setView: (v: "date" | "month" | "year") => void
    yearConfig: { startYear: number; endYear: number; yearsPerPage: number }
}

export default function YearPicker({
    currentMonth,
    onYearSelect,
    yearRangeStart,
    setYearRangeStart,
    setView,
    yearConfig,
}: Props) {
    const { startYear, endYear, yearsPerPage } = yearConfig
    const rangeEnd = Math.min(yearRangeStart + yearsPerPage - 1, endYear)
    const years = Array.from({ length: rangeEnd - yearRangeStart + 1 }, (_, i) => yearRangeStart + i)
    const isPrevDisabled = yearRangeStart <= startYear
    const isNextDisabled = yearRangeStart + yearsPerPage > endYear

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => !isPrevDisabled && setYearRangeStart(yearRangeStart - yearsPerPage)}
                        disabled={isPrevDisabled}
                        className={`p-1 rounded-full ${isPrevDisabled ? "text-gray-4 cursor-not-allowed" : "hover:text-orange-5 cursor-pointer"}`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h4 className="font-medium text-[14px] min-w-[80px] text-center">{yearRangeStart}-{rangeEnd}</h4>
                    <button
                        onClick={() => !isNextDisabled && setYearRangeStart(yearRangeStart + yearsPerPage)}
                        disabled={isNextDisabled}
                        className={`p-1 rounded-full ${isNextDisabled ? "text-gray-4 cursor-not-allowed" : "hover:text-orange-5 cursor-pointer"}`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <button onClick={() => setView("month")} className="text-[12px] text-gray-5 hover:text-orange-5 cursor-pointer">
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {years.map((year) => (
                    <button
                        key={year}
                        onClick={() => {
                            onYearSelect(new Date(year, currentMonth.getMonth(), 1))
                            setView("month")
                        }}
                        className={`p-3 text-sm rounded-md cursor-pointer ${year === currentMonth.getFullYear() ? "bg-orange-5 text-white" : "hover:bg-orange-1 text-gray-9"
                            }`}
                    >
                        {year}
                    </button>
                ))}
            </div>
        </div>
    )
}
