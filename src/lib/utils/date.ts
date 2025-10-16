// "14 Oct, 2025"
// export const formatDate = (date: Date) => {
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//     const day = date.getDate().toString().padStart(2, '0')
//     const month = months[date.getMonth()]
//     const year = date.getFullYear()
//     return `${day} ${month}, ${year}`
// }

// "October 14, 2025"
export function formatDateLocale(date: Date | undefined) {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

// หาจำนวนวันในเดือน
export const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

// หาว่าวันแรกของเดือนตรงกับวันอะไรในสัปดาห์
export const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

// แปลงเวลาเป็น timezone thai
export const formatToThaiTimeAD = (isoString: string | undefined | string[]) => {
    if (typeof isoString === "string") {
        const date = new Date(isoString);
        return date.toLocaleString("en-GB", {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
}

// แปลงวันที่เป็นรูปแบบ "25 Aug, 2023"
export const formatToddMMyyyy = (isoString: string | undefined | string[]) => {
    if (typeof isoString === "string") {
        const date = new Date(isoString);
        return date.toLocaleString("en-GB", {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }
    return "";
}

// แปลงวันที่เป็นรูปแบบ "Tue, 16 Oct 2022"
export const formatTodddMMyyyy = (isoString: string | undefined | string[]) => {
    if (typeof isoString === "string") {
        const date = new Date(isoString);
        return date.toLocaleString("en-GB", {
            timeZone: "Asia/Bangkok",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }
    return "";
}

// ==================== เพิ่มใหม่ ====================

// แปลง Date → "YYYY-MM-DD"
export function toYmd(date?: Date | null): string {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// แปลง "YYYY-MM-DD" → Date
export function parseYmd(ymd?: string | null): Date | undefined {
    if (!ymd) return undefined;
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
}

// เช็คว่าเดือนเดียวกันไหม
export function sameMonth(d1?: Date | null, d2?: Date | null): boolean {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

// จำกัดวันให้อยู่ในช่วงที่ถูกต้อง
export function clampDay(year: number, month: number, day: number): number {
    const maxDay = new Date(year, month + 1, 0).getDate();
    return Math.min(Math.max(1, day), maxDay);
}

// เพิ่มยู แปลงเป็น "20 Sep 2025" (ไม่มี comma)
export function formatDdMmmYyyy(isoString?: string): string {
    if (!isoString || typeof isoString !== "string") return "";
    
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { 
        month: "short",
        timeZone: "Asia/Bangkok" 
    });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
}