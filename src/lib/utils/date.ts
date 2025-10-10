export const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const day = date.getDate().toString().padStart(2, '0')
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
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
            weekday: "short",  // เพิ่มบรรทัดนี้
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }
    return "";
}