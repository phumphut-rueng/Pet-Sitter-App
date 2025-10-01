import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useMemo } from "react"
import { YearProps } from "@/types/date-picker.types"

export default function YearPicker({
    currentMonth,
    onYearSelect,
    yearRangeStart,
    setYearRangeStart,
    setView,
    yearConfig,
}: YearProps) {
    const { startYear, endYear, yearsPerPage } = yearConfig
    const isPrevDisabled = yearRangeStart <= startYear
    const isNextDisabled = yearRangeStart + yearsPerPage > endYear

    //สร้าง label year เช่น [2020, 2021, 2022, 2023, 2024, 2025]
    const yearRange = useMemo(() => {
        const rangeEnd = Math.min(yearRangeStart + yearsPerPage - 1, endYear)
        const years = Array.from({ length: rangeEnd - yearRangeStart + 1 }, (_, i) => yearRangeStart + i)
        return years
    }, [yearRangeStart, yearsPerPage, endYear])


    // สร้าง label แสดง range ของปี เช่น "2000-2011"
    const yearRangeLabel = useMemo(() => {
        const rangeEnd = Math.min(yearRangeStart + yearsPerPage - 1, endYear)
        return `${yearRangeStart}-${rangeEnd}`
    }, [yearRangeStart, yearsPerPage, endYear])

    // handle
    const handleYearRangePrev = useCallback(() => {
        setYearRangeStart((prev: number) => {
            const newStart = prev - yearsPerPage
            return newStart >= startYear ? newStart : prev
        })
    }, [yearsPerPage, startYear, setYearRangeStart])

    const handleYearRangeNext = useCallback(() => {
        setYearRangeStart((prev: number) => {
            const newStart = prev + yearsPerPage
            return newStart <= endYear ? newStart : prev
        })
    }, [yearsPerPage, endYear, setYearRangeStart])

    const handleYearSelect = useCallback(
        (year: number) => {
            onYearSelect(new Date(year, currentMonth.getMonth(), 1))
            setView("month")
        },
        [currentMonth, onYearSelect, setView]
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleYearRangePrev}
                        disabled={isPrevDisabled}
                        className={`p-1 rounded-full 
                            ${isPrevDisabled
                                ? "text-gray-4 cursor-not-allowed"
                                : "hover:text-orange-5 cursor-pointer"}`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h4 className="font-medium text-[14px] min-w-[80px] text-center">
                        {yearRangeLabel}
                    </h4>
                    <button
                        onClick={handleYearRangeNext}
                        disabled={isNextDisabled}
                        className={`p-1 rounded-full 
                            ${isNextDisabled
                                ? "text-gray-4 cursor-not-allowed"
                                : "hover:text-orange-5 cursor-pointer"}`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <button
                    onClick={() => setView("month")}
                    className="text-[12px] text-gray-5 hover:text-orange-5 cursor-pointer">
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
                                ? "bg-orange-5 text-white"
                                : "hover:bg-orange-1 text-gray-9"
                            }`}
                    >
                        {year}
                    </button>
                ))}
            </div>
        </div>
    )
}
