import React, { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRound } from "lucide-react"
import Link from "next/link"
import { User } from "@/types/user.types";
import { MenuItem } from "@/types/navigation.types";

interface AvatarDropdownProps {
  user: User | null
  menuItems: MenuItem[]
  onLogout: () => void
  onNavigate: (path: string) => void
}

const AvatarDropdown = ({ user, menuItems, onLogout, onNavigate }: AvatarDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  // Don't render if no user
  if (!user) {
    return null
  }

  const userAvatar = user.profile_image
  const userName = user.name
  const userInitials = userName
    ? userName.split(' ').map(name => name.charAt(0)).join('').toUpperCase()
    : 'U'

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  const handleMenuItemClick = (item: MenuItem) => {
    setIsOpen(false)

    if (item.isLogout) {
      onLogout()
    } else {
      onNavigate(item.href)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger className="outline-hidden">
        <Avatar className="w-12 h-12 cursor-pointer">
          {userAvatar ? (
            <AvatarImage src={userAvatar} alt={userName || "Profile"} />
          ) : null}
          <AvatarFallback className="bg-gray-2 text-gray-6">
            <UserRound className="size-6" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[186px] bg-white border-0 shadow-md pb-2"
        align="end"
        sideOffset={8}
      >
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {/* Add separator before logout */}
            {item.isLogout && (
              <DropdownMenuSeparator className="my-3 bg-gray-2" />
            )}

            <DropdownMenuItem
              className="flex items-center gap-3 px-6 py-3 cursor-pointer"
              onClick={() => handleMenuItemClick(item)}
            >
              {item.avatarIcon && <item.avatarIcon className="size-5" />}
              <span className="text-[16px] font-medium font-weight-500">
                {item.avatarText || item.text}
              </span>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AvatarDropdown