import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useMemo } from "react"
import { YearProps } from "@/types/date-picker.types"
import { NavigationButton } from "../buttons/NavigationButton"

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
    const rangeEnd = useMemo(
        () => Math.min(yearRangeStart + yearsPerPage - 1, endYear),
        [yearRangeStart, yearsPerPage, endYear]
    )

    //สร้าง label year เช่น [2020, 2021, 2022, 2023, 2024, 2025]
    const yearRange = useMemo(() => {
        return Array.from(
            { length: rangeEnd - yearRangeStart + 1 },
            (_, i) => yearRangeStart + i)
    }, [yearRangeStart, rangeEnd])


    // สร้าง label แสดง range ของปี เช่น "2000-2011"
    const yearRangeLabel = useMemo(() => {
        return `${yearRangeStart}-${rangeEnd}`
    }, [yearRangeStart, rangeEnd])

    // handle
    const handleYearRangeChange = (step: number) => {
        setYearRangeStart((prev: number) => {
            const newStart = prev + step * yearsPerPage
            if (newStart < startYear || newStart > endYear) {
                return prev
            }
            return newStart
        })
    }

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
                    <NavigationButton
                        onClick={() => handleYearRangeChange(-1)}
                        disabled={isPrevDisabled}
                        icon={<ChevronLeft className="h-5 w-5" />}
                    />
                    <h4 className="font-medium text-[14px] min-w-[80px] text-center">
                        {yearRangeLabel}
                    </h4>
                    <NavigationButton
                        onClick={() => handleYearRangeChange(1)}
                        disabled={isNextDisabled}
                        icon={<ChevronRight className="h-5 w-5" />}
                    />
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
