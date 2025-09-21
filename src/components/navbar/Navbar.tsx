import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AvatarDropdown from "./AvatarDropdown";
import NotificationButton from "./NotificationButton";
import MessageButton from "./MessageButton";
import MobileMenu from "./MobileMenu";
import { getMenuItems } from "./menuConfig";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/buttons/primaryButton";
// import { useAuth } from "@/contexts/AuthContext"; // Uncomment when AuthContext is implemented

const Navbar = () => {
  const router = useRouter();
  // TODO: Uncomment when AuthContext is implemented
  // const { user, isLoggedIn, isLoading } = useAuth();
  // const isSitter = user?.isSitter || false;

  // Temporary hardcoded values - remove when auth context is ready
  const isLoggedIn = true;
  const isSitter = true;
  const isLoading = false;

  const menuItems = getMenuItems(isLoggedIn, isSitter);

  return (
    <nav className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
        <div className="flex justify-between items-center h-12 py-3 md:h-20">
          {/* Logo */}
          <div className="h-6 md:h-10">
            <Image
              src="/icons/logo.svg"
              alt="Logo"
              width={131}
              height={100}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden md:flex items-center justify-end space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ) : isLoggedIn ? (
              <>
                <NotificationButton
                  initialHasNotification={true}
                />
                <MessageButton
                  initialHasMessage={true}
                />
                <AvatarDropdown />
              </>
            ) : (
              menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-black hover:text-gray-7 px-6 py-2 text-sm font-medium transition-colors"
                >
                  {item.text}
                </Link>
              ))
            )}

            
            <Link href="/find-a-pet-sitter">
            <PrimaryButton text="Find a Pet Sitter" textColor="white" bgColor="primary" className="w-full justify-center my-4"/>
            </Link>
          </div>

          {/* Mobile Icons and Menu Button */}
          <div className="md:hidden flex items-center justify-end gap-6">
            {isLoading ? (
              <div className="flex items-center gap-6">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                {/* Notification Icon */}
                <NotificationButton
                  variant="mobile"
                  initialHasNotification={true}
                />

                {/* Message Icon */}
                <MessageButton
                  variant="mobile"
                  initialHasMessage={true}
                />

                {/* Mobile Menu Component with Hamburger Button */}
                <MobileMenu />
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
