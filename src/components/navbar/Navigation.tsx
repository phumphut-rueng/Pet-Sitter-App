import React from "react";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { NavigationProps } from "@/types/navigation.types";
import { useRouter } from "next/router";

const Navigation: React.FC<NavigationProps> = ({
  isLoading,
  isAuthenticated,
  user,
  menuItems,
  onNavigate,
  onLogout,
}) => {
  const router = useRouter();

  //  ตัวช่วยนำทางแบบปลอดภัย:
  // - ข้ามถ้า href ว่าง
  // - ถ้าเป็นลิงก์ภายนอก => location.href
  // - ถ้าหน้าปัจจุบันอยู่แล้ว => ข้าม
  // - อย่างอื่น => ใช้ onNavigate (จะไป router.push ที่ Navbar)
  const safeNavigate = React.useCallback(
    (href: string) => {
      if (!href) return;

      // normalize
      const target = href.trim();

      // ลิงก์ภายนอก
      if (target.startsWith("http://") || target.startsWith("https://")) {
        window.location.href = target;
        return;
      }

      // ถ้าหน้าปัจจุบันอยู่แล้ว ไม่ต้อง push ซ้ำ
      // (รองรับ query string ด้วย)
      const now = router.asPath;
      if (now === target) return;

      onNavigate(target);
    },
    [onNavigate, router.asPath]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-end space-x-4">
        <div className="h-9 w-28 rounded-full bg-gray-1 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <DesktopNav
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        user={user}
        menuItems={menuItems}
        onNavigate={safeNavigate}  // ใช้ safeNavigate
        onLogout={onLogout}
      />
      <MobileNav
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        user={user}
        menuItems={menuItems}
        onNavigate={safeNavigate}  //  ใช้ safeNavigate
        onLogout={onLogout}
      />
    </>
  );
};

export default Navigation;