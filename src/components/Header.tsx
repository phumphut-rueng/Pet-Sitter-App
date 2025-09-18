import React from 'react';
import Image from 'next/image';

const Header = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <header className="w-full bg-white">
        <div className="flex justify-between items-center h-20 py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/images/landing_page/logo.svg"
              alt="Sitter Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <button className="text-gray-700 hover:text-pet-secondary-orange transition-colors font-medium">
              Become a Pet Sitter
            </button>
            <button className="text-gray-700 hover:text-pet-secondary-orange transition-colors font-medium">
              Login
            </button>
            <button className="bg-primary hover:bg-pet-secondary-coral text-white px-6 py-3 rounded-full transition-colors font-medium shadow-lg">
              Find A Pet Sitter
            </button>
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;
