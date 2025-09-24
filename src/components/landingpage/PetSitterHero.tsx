import React from "react";
import Image from "next/image";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import Link from "next/link";
import { satoshi } from "@/fonts";

const PetSitterHero = () => {
  return (
    <div className={`${satoshi.className} py-20`}>
      <div className="relative bg-yellow-bg rounded-xl p-8 sm:p-12 lg:p-16 overflow-hidden">
        {/* Decorative Shapes */}
        {/* Bottom Left - Blue Arch Shape */}
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 translate-y-[50%]">
          <Image
            src="/images/landing_page/Ellipse 17.svg"
            alt="Blue arch shape"
            width={256}
            height={256}
            className="pointer-events-none select-none object-contain w-full h-full"
          />
        </div>

        {/* Top Right - Star and Circle */}
        <div className="absolute top-0 right-0 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-60 xl:h-60">
          <Image
            src="/images/landing_page/StarAndCircle.svg"
            alt="Star and circle"
            width={240}
            height={240}
            className="pointer-events-none select-none object-contain w-full h-full"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-black mb-5 sm:mb-5 leading-tight">
            Perfect Pet Sitter
            <br />
            For Your Pet
          </h1>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-1 justify-center items-center">
            {/* Become A Pet Sitter Button */}
            <Link
              href="/register"
              aria-label="Go to become a pet sitter page"
            >
              <button className="text-orange-5 font-semibold hover:text-orange-6 transition-colors duration-200 min-w-[200px] sm:min-w-[220px]">
                Become A Pet Sitter
              </button>
            </Link>

            {/* Find A Pet Sitter Button */}
            <Link
              href="/find-a-pet-sitter"
              aria-label="Go to find a pet sitter page"
            >
              <PrimaryButton
                text="Find a Pet Sitter"
                textColor="white"
                bgColor="primary"
                className="w-full justify-center my-4"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetSitterHero;
