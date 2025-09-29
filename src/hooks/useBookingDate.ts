import { useState } from "react"
import { format } from "date-fns"

export function useBookingDate() {
    const [isOpen, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [month, setMonth] = useState<Date | undefined>(date)
    const [value, setValue] = useState("")

    function formatDate(date: Date | undefined) {
        if (!date) return ""
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
    }

    function handleSelect(d?: Date) {
        setDate(d)
        if (d) setValue(formatDate(d))
        setOpen(false)
    }

    return {
        isOpen,
        setOpen,
        date,
        month,
        setMonth,
        value,
        handleSelect,
    }
}
