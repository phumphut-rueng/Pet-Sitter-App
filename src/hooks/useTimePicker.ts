import { useState } from "react"

export function useTimePicker() {
    const [startTime, setStartTime] = useState<Date | undefined>(undefined)
    const [endTime, setEndTime] = useState<Date | undefined>(undefined)

    // Helper function to validate time range
    const isValidTimeRange = () => {
        if (!startTime || !endTime) return false
        return startTime < endTime
    }

    return {
        startTime,
        endTime,
        setStartTime,
        setEndTime,
        isValidTimeRange,
    }
}