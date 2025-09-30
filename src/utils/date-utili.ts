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