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
import { getMenuItems } from "./menuConfig"
// import { useAuth } from "@/contexts/AuthContext"; // Uncomment when AuthContext is implemented

const AvatarDropdown = () => {
  // TODO: Uncomment when AuthContext is implemented
  // const { user } = useAuth();
  // const isSitter = user?.isSitter || false;
  // const userAvatar = user?.avatar;
  // const userName = user?.name;

  // Temporary hardcoded values - remove when auth context is ready
  const isSitter = true;
  const userAvatar = undefined;
  const userName = undefined;
  const [isOpen, setIsOpen] = useState(false)
  const menuItems = getMenuItems(true, isSitter) // Always logged in for avatar dropdown

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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="outline-hidden">
        <Avatar className="w-12 h-12 cursor-pointer">
          <AvatarImage src={userAvatar || "icons/Ellipse-16.svg"} alt={userName || "Profile"} />
          <AvatarFallback className="bg-gray-200 text-gray-600">
            <UserRound className="size-6" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[186px] bg-white border-none"
        align="end"
        sideOffset={8}
      >
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {/* Add separator before logout */}
            {item.isLogout && (
              <DropdownMenuSeparator className="my-2 bg-gray-2" />
            )}

            <Link href={item.href}>
              <DropdownMenuItem className="flex items-center gap-3 px-6 py-2 cursor-pointer">
                {item.avatarIcon && <item.avatarIcon className="size-5" />}
                <span className="text-[16px] font-medium font-weight-500">
                  {item.avatarText || item.text}
                </span>
              </DropdownMenuItem>
            </Link>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AvatarDropdown