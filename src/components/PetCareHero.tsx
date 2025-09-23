import React from "react";
import Image from "next/image";
import ServicesSection from "./ServicesSection";

const PetCareHero = () => {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Main Heading */}
      <div className="text-center mb-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-black leading-tight">
           "Your Pets, Our Priority: Perfect Care, Anytime, Anywhere."
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-12 lg:gap-10px-1 px-1 md:px-4 lg:px-8">
        {/* Left Section - Services */}
        <div className="w-full lg:w-1/2">
          <ServicesSection />
        </div>

        {/* Right Section - Image */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="w-80 h-fit lg:w-96 lg:h-fit flex items-center justify-center relative">
              {/* Cat Image */}
              <div className="relative z-10">
                <Image
                  src="/images/landing_page/lovely-pet-portrait-isolated.svg"
                  alt="Cat being petted"
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>
            </div>
          
        </div>
      </div>
    </div>
  );
};

export default PetCareHero;
