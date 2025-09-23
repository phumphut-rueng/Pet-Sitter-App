import React from "react";
import Image from "next/image";

const Footer = () => {
  return (
    <div className="border-2 border-gray-200">
      <div className="bg-black">
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 border-2 border-red-500">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex-shrink-0">
              <Image
                src="/images/landing_page/logoFooter.svg"
                alt="Logo"
                width={180}
                height={100}
                className="w-30 md:w-45 object-contain"
                priority
              />
            </div>
          </div>

          {/* Tagline */}
          <p className="text-white text-lg sm:text-xl lg:text-2xl text-center font-medium">
            Find your perfect pet sitter with us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
