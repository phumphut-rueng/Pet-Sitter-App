import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Bell, MessageSquare, Menu, X } from "lucide-react";
import IconButton from "./IconButton";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { NavigationProps, MenuItem } from "@/types/navigation.types";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const MobileNav: React.FC<NavigationProps> = ({
  isAuthenticated,
  user,
  menuItems,
  onNavigate,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // unread สำหรับแชต
  const { hasUnread } = useUnreadCount(user?.id?.toString());

  const openMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "";
  }, []);

  const toggleMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMenu();
    }
  }, [isMobileMenuOpen, closeMobileMenu, openMenu]);

  // ปิดเมนูเมื่อหน้าจอขยายถึง md / กด Esc
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) closeMobileMenu();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [closeMobileMenu]);

  const handleMobileMenuItemClick = async (item: MenuItem) => {
    closeMobileMenu();
    if (item.isLogout) await onLogout();
    else onNavigate(item.href);
  };

  const handleFindPetSitterClick = () => {
    closeMobileMenu();
    onNavigate("/findpetsitter");
  };

  // helper เช็ค active path (รองรับ query/child routes)
  const isActive = (href: string) =>
    router.asPath === href ||
    router.asPath.startsWith(href + "?") ||
    router.asPath.startsWith(href + "/");

  return (
    <div className="md:hidden flex items-center justify-end gap-6">
      {isAuthenticated && (
        <>
          <IconButton
            icon={Bell}
            route="/notifications"
            hasIndicator={false}
            aria-label="Notifications"
            onNavigate={onNavigate}
            variant="mobile"
          />
          <IconButton
            icon={MessageSquare}
            route="/chat"
            hasIndicator={hasUnread}
            aria-label="Messages"
            onNavigate={onNavigate}
            variant="mobile"
          />
        </>
      )}

      {/* Hamburger */}
      <button
        onClick={toggleMobileMenu}
        className="rounded-md p-2 text-gray-6 hover:text-orange-6 hover:bg-orange-1/40 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        aria-expanded={isMobileMenuOpen}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Overlay + Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* คลิกพื้นหลังเพื่อปิด */}
          <div className="absolute inset-0" onClick={closeMobileMenu} aria-hidden />
          {/* Drawer */}
          <nav
            className="absolute left-0 right-0 top-12 md:top-20 bottom-0 bg-white shadow-lg rounded-t-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="px-4 py-10 flex flex-col h-full overflow-y-auto">
              {menuItems.map((item, index) => {
                const active = isActive(item.href);
                return (
                  <React.Fragment key={index}>
                    {item.isLogout && <div className="border-b border-gray-2 my-4" />}
                    <button
                      onClick={() => handleMobileMenuItemClick(item)}
                      aria-current={active ? "page" : undefined}
                      className={[
                        // กลุ่มเดียวกันให้ไอคอนรับ currentColor
                        "group w-full text-left p-4 rounded-xl transition-colors",
                        "flex items-center gap-3 text-[18px] font-medium",
                        active ? "text-orange-5 bg-orange-1/40" : "text-ink hover:text-orange-5 hover:bg-orange-1/40",
                        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                      ].join(" ")}
                    >
                      {/* เอาสีออกจาก icon -> ใช้ text-current เพื่อให้รับสีจากปุ่ม */}
                      {item.icon && <item.icon className="w-5 h-5 shrink-0 text-current" />}
                      <span>{item.text}</span>
                    </button>
                  </React.Fragment>
                );
              })}

              <PrimaryButton
                text="Find a Pet Sitter"
                textColor="white"
                bgColor="primary"
                className="w-full justify-center my-4"
                onClick={handleFindPetSitterClick}
              />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileNav;