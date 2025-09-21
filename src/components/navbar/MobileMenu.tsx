import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import PrimaryButton from "@/components/buttons/primaryButton";
import { getMenuItems } from "./menuConfig";
// import { useAuth } from "@/contexts/AuthContext"; // Uncomment when AuthContext is implemented

const MobileMenu = () => {
  // TODO: Uncomment when AuthContext is implemented
  // const { user, isLoggedIn } = useAuth();
  // const isSitter = user?.isSitter || false;

  // Temporary hardcoded values - remove when auth context is ready
  const isLoggedIn = true;
  const isSitter = true;
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuItems = getMenuItems(isLoggedIn, isSitter);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        closeMenu();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden rounded-md text-gray-6 hover:text-gray-9 hover:bg-gray-1"
        aria-expanded={isOpen}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <nav
          className="md:hidden fixed inset-0 top-12 md:top-20 z-50 bg-white scrollbar-hide"
        >
          <div className="px-4 py-10 flex flex-col">
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                {/* Add separator before logout */}
                {item.isLogout && (
                  <div className="border-b border-gray-2 my-4"></div>
                )}

                <Link
                  href={item.href}
                  className={`p-4 font-medium text-black text-[18px] ${
                    item.icon ? 'gap-3 flex items-center' : ''
                  }`}
                  onClick={closeMenu}
                >
                  {item.icon && <item.icon className="w-5 h-5" />} {item.text}
                </Link>
              </React.Fragment>
            ))}

            {/* Find Pet Sitter Button - always show */}
            <Link href="/find-a-pet-sitter">
              <PrimaryButton
                text="Find a Pet Sitter"
                textColor="white"
                bgColor="primary"
                className="w-full justify-center my-4"
                onClick={closeMenu}
              ></PrimaryButton>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
};

export default MobileMenu;