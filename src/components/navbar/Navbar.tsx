import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, UserRound } from "lucide-react";
import PrimaryButton from "@/components/buttons/primaryButton";
import AvatarDropdown from "./AvatarDropdown";
import NotificationButton from "./NotificationButton";
import MessageButton from "./MessageButton";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isSitter = false;
  const isLoggedIn = true;

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
            {isLoggedIn ? (
              <>
                <NotificationButton
                  initialHasNotification={true}
                  onClick={() => console.log("Notification clicked")}
                />
                <MessageButton
                  initialHasMessage={true}
                  onClick={() => console.log("Message clicked")}
                />
                <AvatarDropdown isSitter={isSitter} />
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="text-black hover:text-gray-7 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Register
                </Link>

                <Link
                  href="/login"
                  className="text-black hover:text-gray-7 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
              </>
            )}

            <Button className="bg-orange-5 hover:bg-orange-6 text-white px-6 py-2 rounded-full">
              Find a Pet Sitter
            </Button>
          </div>

          {/* Mobile Icons and Menu Button */}
          <div className="md:hidden flex items-center justify-end gap-6">
            {/* Notification Icon */}
            <NotificationButton
              variant="mobile"
              initialHasNotification={true}
              onClick={() => console.log("Notification clicked")}
            />

            {/* Message Icon */}
            <MessageButton
              variant="mobile"
              initialHasMessage={true}
              onClick={() => console.log("Message clicked")}
            />

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="rounded-md text-gray-6 hover:text-gray-9 hover:bg-gray-1"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } md:hidden fixed inset-0 top-12 md:top-20 z-50 bg-white`}
        >
          <div className="px-4 py-10 flex flex-col">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="p-4 font-medium text-black text-[18px] gap-3 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserRound className="w-5 h-5" /> Profile
                </Link>
                <Link
                  href="/your-pet"
                  className="p-4 font-medium text-black text-[18px] gap-3 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserRound className="w-5 h-5" /> Profile Your Pet
                </Link>
                <Link
                  href="/booking-history"
                  className="p-4 font-medium text-black text-[18px] gap-3 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserRound className="w-5 h-5" /> Profile Booking History
                </Link>

                {/* Sitter Profile */}
                {/* show only if user is a sitter */}
                {isSitter && (
                <Link
                  href="/sitter-profile"
                  className="p-4 font-medium text-black text-[18px] gap-3 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserRound className="w-5 h-5" />Sitter Profile
                </Link>
                )}
                
                <div className="border-b border-gray-2 my-4"></div>
                <Link
                  href="/logout"
                  className="p-4 font-medium text-black text-[18px] gap-3 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserRound className="w-5 h-5" />
                  Logout
                </Link>
                <Link href="/find-a-pet-sitter">
                  <PrimaryButton
                    text="Find a Pet Sitter"
                    textColor="white"
                    bgColor="primary"
                    className="w-full justify-center my-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  ></PrimaryButton>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="p-4 font-medium text-black text-[18px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="p-4 font-medium text-black text-[18px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>

                <Link href="/find-a-pet-sitter">
                  <PrimaryButton
                    text="Find a Pet Sitter"
                    textColor="white"
                    bgColor="primary"
                    className="w-full justify-center my-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  ></PrimaryButton>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;
