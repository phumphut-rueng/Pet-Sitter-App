import React from "react";
import Image from "next/image";
import { satoshi } from "@/fonts";


const HeroSection = () => {
  return (
    <div className="container mx-auto py-8 sm:py-12 lg:py-16 overflow-hidden bg-white">
      <section className="flex flex-col md:grid md:items-center" style={{gridTemplateColumns: '1fr 1.5fr 1fr'}}>
        {/* LEFT VISUALS */}
        <div className=" h-[300px] sm:h-[300px] lg:h-[300px] xl:h-[350px] order-1 md:order-none flex items-center justify-center">
          <Image 
            src="/images/landing_page/3Cats.svg" 
            alt="Three cats" 
            width={300} 
            height={300} 
            className="pointer-events-none select-none object-contain media-fluid"
          />
        </div>

        {/* CENTER TEXT */}
        <div className="text-center px-2 py-4 sm:px-4 lg:px-1 order-2 md:order-none">
          <h1 className={`${satoshi.className} font-bold leading-tight mb-3 text-5xl md:text-5xl lg:text-6xl`}>
            <span className="block text-black">Pet Sitter<span className="text-orange-5">,</span></span>
            <span className="block text-black">Perfect<span className="text-[var(--blue)]">,</span></span>
            <span className="block text-black">For Your Pet<span className="text-[var(--yellow)]">.</span></span>
          </h1>
          <p className={`${satoshi.className} mt-2 sm:mt-4 lg:mt-5 text-base h4 text-gray-6 max-w-lg mx-auto leading-relaxed font-sans`}>
            Find your perfect pet sitter with us.
          </p>
        </div>

        {/* RIGHT VISUALS */}
        <div className=" h-[290px] sm:h-[300px] lg:h-[300px] xl:h-[350px] order-3 md:order-none flex items-center justify-center">
          <Image 
            src="/images/landing_page/GlassesDog.svg" 
            alt="Dog" 
            width={300} 
            height={300} 
            className="pointer-events-none select-none object-contain media-fluid"
          />
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
