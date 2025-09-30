import { ChevronLeft, ChevronDown } from "lucide-react"

interface Props {
    currentMonth: Date
    openYearPicker: () => void
    onMonthSelect: (d: Date) => void
    setView: (v: "date" | "month" | "year") => void
}

export default function MonthPicker({
    currentMonth,
    openYearPicker,
    onMonthSelect,
    setView
}: Props) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

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
                {months.map((m, idx) => (
                    <button
                        key={m}
                        onClick={() => {
                            onMonthSelect(new Date(currentMonth.getFullYear(), idx, 1))
                            setView("date")
                        }}
                        className={`p-3 text-sm rounded-md cursor-pointer 
                            ${idx === currentMonth.getMonth()
                                ? "bg-orange-5 text-white"
                                : "hover:bg-orange-1 text-gray-9"
                            }`}
                    >
                        {m.substring(0, 3)}
                    </button>
                ))}
            </div>
        </div>
    )
}
