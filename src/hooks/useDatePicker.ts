import { formatDateLocale } from "@/lib/utils/date"
import { useState } from "react"

export function useDatePicker() {
    // State สำหรับ Date Picker
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [month, setMonth] = useState<Date | undefined>(date)
    const [value, setValue] = useState("")

    // function formatDate(date: Date | undefined) {
    //     if (!date) return ""
    //     return date.toLocaleDateString("en-US", {
    //         day: "2-digit",
    //         month: "long",
    //         year: "numeric",
    //     })
    // }

    function handleSelect(d?: Date) {
        setDate(d)
        if (d) setValue(formatDateLocale(d))
    }

    return {
        date,
        month,
        setMonth,
        value,
        handleSelect,
    }
}
