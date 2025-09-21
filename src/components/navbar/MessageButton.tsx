import React, { useState } from "react"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

interface MessageButtonProps {
  initialHasMessage?: boolean
  variant?: "desktop" | "mobile"
}

const MessageButton = ({
  initialHasMessage = true,
  variant = "desktop"
}: MessageButtonProps) => {
  const [hasMessage, setHasMessage] = useState(initialHasMessage)
  const router = useRouter()

  const handleClick = () => {
    setHasMessage(false)
    router.push('/messages')
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
      <MessageSquare className={`${iconSize} text-gray-600`} />
      {hasMessage && (
        <div className={`absolute ${dotPosition} w-3 h-3 bg-orange-500 rounded-full`}></div>
      )}
    </button>
  )
}

export default MessageButton