import React, { useEffect, useState } from "react";
import { Bell, MessageSquare, Menu, X } from "lucide-react";
import IconButton from "./IconButton";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { NavigationProps, MenuItem } from "@/types/navigation.types";

const MobileNav: React.FC<NavigationProps> = ({
  isAuthenticated,
  menuItems,
  onNavigate,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    // Prevent body scrolling when menu is open
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    // Restore body scrolling
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup: restore body scrolling on unmount
      document.body.style.overflow = '';
    };
  }, []);

  const handleMobileMenuItemClick = async (item: MenuItem) => {
    closeMobileMenu();
    if (item.isLogout) {
      await onLogout();
    } else {
      onNavigate(item.href);
    }
  };

  const handleFindPetSitterClick = () => {
    closeMobileMenu();
    onNavigate('/findpetsitter');
  };

  return (
    <div className="md:hidden flex items-center justify-end gap-6">
      {isAuthenticated && (
        <>
          <IconButton
            icon={Bell}
            route="/notifications"
            hasIndicator={true}
            aria-label="Notifications"
            onNavigate={onNavigate}
          />
          <IconButton
            icon={MessageSquare}
            route="/messages"
            hasIndicator={true}
            aria-label="Messages"
            onNavigate={onNavigate}
          />
        </>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="rounded-md text-gray-6 hover:text-gray-9 hover:bg-gray-1"
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <nav className="fixed left-0 right-0 top-12 md:top-20 bottom-0 z-50 bg-white">
          <div className="px-4 py-10 flex flex-col h-full overflow-y-auto">
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                {item.isLogout && (
                  <div className="border-b border-gray-2 my-4"></div>
                )}
                <button
                  onClick={() => handleMobileMenuItemClick(item)}
                  className={`p-4 font-medium text-black text-[18px] text-left w-full ${
                    item.icon ? 'gap-3 flex items-center' : ''
                  }`}
                >
                  {item.icon && <item.icon className="w-5 h-5" />} {item.text}
                </button>
              </React.Fragment>
            ))}

            <PrimaryButton
              text="Find a Pet Sitter"
              textColor="white"
              bgColor="primary"
              className="w-full justify-center my-4"
              onClick={handleFindPetSitterClick}
            />
          </div>
        </nav>
      )}
    </div>
  );
};

export default MobileNav;