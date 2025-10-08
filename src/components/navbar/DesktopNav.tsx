import React from "react";
import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import IconButton from "./IconButton";
import AvatarDropdown from "./AvatarDropdown";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { NavigationProps } from "@/types/navigation.types";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const DesktopNav: React.FC<NavigationProps> = ({
  isAuthenticated,
  user,
  menuItems,
  onNavigate,
  onLogout
}) => {
  // ใช้ hook เพื่อดึง unread count
  const { hasUnread } = useUnreadCount(user?.id?.toString());

  return (
    <div className="hidden md:flex items-center justify-end space-x-4">
      {isAuthenticated ? (
        <>
          <IconButton
            icon={Bell}
            route="/notifications"
            hasIndicator={false} // ปิด notification indicator ชั่วคราว
            aria-label="Notifications"
            onNavigate={onNavigate}
          />
          <IconButton
            icon={MessageSquare}
            route="/chat" // เปลี่ยนจาก /messages เป็น /chat
            hasIndicator={hasUnread} // ใช้ unread count จริง
            aria-label="Messages"
            onNavigate={onNavigate}
          />
          <AvatarDropdown
            user={user}
            menuItems={menuItems}
            onLogout={onLogout}
            onNavigate={onNavigate}
          />
        </>
      ) : (
        <>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-black hover:text-gray-7 px-6 py-2 text-sm font-medium transition-colors"
            >
              {item.text}
            </Link>
          ))}
        </>
      )}

      <Link href="/findpetsitter">
        <PrimaryButton
          text="Find a Pet Sitter"
          textColor="white"
          bgColor="primary"
          className="w-full justify-center my-4"
        />
      </Link>
    </div>
  );
};

export default DesktopNav;