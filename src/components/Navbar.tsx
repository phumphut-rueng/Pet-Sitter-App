import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 lg:h-20">
          {/* Logo */}

          <Image src="/icons/logo.svg" alt="Logo" width={131} height={100} />

          {/* Desktop Navigation */}
          {/* <div className="hidden lg:flex lg:items-center lg:space-x-8">
          <Link 
              href="/become-pet-sitter" 
              className="text-black hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/become-pet-sitter" 
              className="text-black hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              About
            </Link>
          </div> */}

          {/* Desktop Right Section */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-4">
            <Link
              href="/register"
              className="text-black hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Register
            </Link>

            <Link
              href="/login"
              className="text-black hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full">
              Find a Pet Sitter
            </Button>
          </div>

          {/* Mobile Icons and Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            {/* Notification Icon */}
            <button className="p-2 rounded-full hover:bg-gray-100 relative"></button>

            {/* Message Icon */}
            <button className="p-2 rounded-full hover:bg-gray-100 relative"></button>

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 "
              aria-expanded="false"
            >
              <Menu />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? "block" : "hidden"} lg:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-gray-200 flex flex-col items-center">
            <Link
              href="/register"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Register
            </Link>
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>

            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full">
              Find a Pet Sitter
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
