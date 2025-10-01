interface Props {
    weeks: { day: number; isCurrentMonth: boolean }[][]
    isDisabled: (day: number) => boolean
    isSelected: (day: number) => boolean
    isToday: (day: number) => boolean
    onDayClick: (day: number) => void
}

{/* ตารางปฏิทิน */ }
export default function CalendarTable({
    weeks,
    isDisabled,
    isSelected,
    isToday,
    onDayClick
}: Props) {
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    return (
        <table className="w-full">
            <thead>
                <tr>
                    {weekDays.map((day) => (
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
                {weeks.map((week, i) => (
                    <tr key={i}>
                        {week.map((d, j) => {
                            const disabled = !d.isCurrentMonth || isDisabled(d.day)
                            const selected = isSelected(d.day)
                            const today = isToday(d.day)

                            return (
                                <td
                                    key={j}
                                    className="text-center p-1">
                                    {d &&
                                        <button
                                            onClick={() => d.isCurrentMonth && onDayClick(d.day)}
                                            disabled={disabled}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center relative 
                                            ${!d.isCurrentMonth
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
                                            {d.day}
                                        </button>
                                    }
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
