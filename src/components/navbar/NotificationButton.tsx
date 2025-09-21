import React, { useState } from "react"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"

interface NotificationButtonProps {
  initialHasNotification?: boolean
  variant?: "desktop" | "mobile"
}

const NotificationButton = ({
  initialHasNotification = true,
  variant = "desktop"
}: NotificationButtonProps) => {
  const [hasNotification, setHasNotification] = useState(initialHasNotification)
  const router = useRouter()

  const handleClick = () => {
    setHasNotification(false)
    router.push('/notifications')
  }

  const isMobile = variant === "mobile"
  const buttonSize = isMobile ? "w-6 h-6" : "w-12 h-12"
  const iconSize = isMobile ? "w-6 h-6" : "w-6 h-6"
  const backgroundClass = isMobile ? "" : "bg-gray-100 hover:bg-gray-200 rounded-full"
  const dotPosition = isMobile ? "top-0 right-0" : "top-2 right-2"

  return (
    <button
      onClick={handleClick}
      className={`relative ${buttonSize} ${backgroundClass} transition-colors flex items-center justify-center`}
    >
      <Bell className={`${iconSize} text-gray-600`} />
      {hasNotification && (
        <div className={`absolute ${dotPosition} w-3 h-3 bg-orange-500 rounded-full`}></div>
      )}
    </button>
  )
}

export default NotificationButton