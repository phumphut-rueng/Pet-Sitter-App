import React, { useState } from "react"
import { LucideIcon } from "lucide-react"

interface IconButtonProps {
  icon: LucideIcon
  onClick?: () => void
  route?: string
  hasIndicator?: boolean
  variant?: 'desktop' | 'mobile'
  'aria-label': string
  onNavigate?: (path: string) => void
  disabled?: boolean
}

const IconButton = ({
  icon: Icon,
  onClick,
  route,
  hasIndicator = false,
  variant = 'desktop',
  'aria-label': ariaLabel,
  onNavigate,
  disabled = false
}: IconButtonProps) => {
  const [indicatorVisible, setIndicatorVisible] = useState(hasIndicator)

  const handleClick = () => {
    if (disabled) return

    // Clear indicator when clicked
    if (indicatorVisible) {
      setIndicatorVisible(false)
    }

    // Handle navigation
    if (onClick) {
      onClick()
    } else if (route && onNavigate) {
      onNavigate(route)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="relative w-6 h-6 md:w-12 md:h-12 md:bg-gray-100 md:hover:bg-gray-200 md:rounded-full transition-colors flex items-center justify-center"
      aria-label={ariaLabel}
      disabled={disabled}
      type="button"
    >
      <Icon className="w-6 h-6 text-gray-600" />
      {indicatorVisible && (
        <div className="absolute top-0 right-0 md:top-2 md:right-2 w-3 h-3 bg-orange-5 rounded-full"></div>
      )}
    </button>
  )
}

export default IconButton