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
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileMenuItemClick = (item: MenuItem) => {
    closeMobileMenu();
    if (item.isLogout) {
      onLogout();
    } else {
      onNavigate(item.href);
    }
  };

  const handleFindPetSitterClick = () => {
    closeMobileMenu();
    onNavigate('/find-a-pet-sitter');
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
        <nav className="fixed inset-0 top-12 md:top-20 z-50 bg-white scrollbar-hide">
          <div className="px-4 py-10 flex flex-col">
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