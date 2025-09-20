"use client"

import React, { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRound, Bookmark, History, LogOut } from "lucide-react"
import Link from "next/link"

const AvatarDropdown = ({isSitter}: {isSitter: boolean}) => {
  const [isOpen, setIsOpen] = useState(false)

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
          <AvatarImage src="images/lovely-pet-portrait-isolated 1.svg" alt="Profile" />
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
        <Link href="/profile">
          <DropdownMenuItem className="flex items-center gap-3 px-6 py-2 cursor-pointer">
            <UserRound className="size-5" />
            <span className="text-[16px] font-medium font-weight-500">Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/your-pet">
          <DropdownMenuItem className="flex items-center gap-3 px-6 py-2 cursor-pointer">
            <Bookmark className="size-5" />
            <span className="text-[16px] font-medium font-weight-500">Your Pet</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/booking-history">
          <DropdownMenuItem className="flex items-center gap-3 px-6 py-2 cursor-pointer">
            <History className="size-5" />
            <span className="text-[16px] font-medium font-weight-500">History</span>
          </DropdownMenuItem>
        </Link>

        {/* Sitter Profile */}
        {/* show only if user is a sitter */}
        {isSitter && (
        <Link href="/sitter-profile">
          <DropdownMenuItem className="flex items-center gap-3 px-6 py-2 cursor-pointer">
            <UserRound className="size-5" />
            <span className="text-[16px] font-medium font-weight-500">Sitter Profile</span>
          </DropdownMenuItem>
        </Link>
        )}

        <DropdownMenuSeparator className="my-2 bg-gray-2" />

        <Link href="/logout">
          <DropdownMenuItem className="flex items-center gap-3 px-6 py-2 my-2 cursor-pointer">
            <LogOut className="size-5" />
            <span className="text-[16px] font-medium font-weight-500">Log out</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AvatarDropdown