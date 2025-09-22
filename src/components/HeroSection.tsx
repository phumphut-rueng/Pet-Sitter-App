import React from "react";
import Image from "next/image";


const HeroSection = () => {
  return (
    <div className="container mx-auto py-8 sm:py-12 lg:py-16 overflow-hidden bg-gray-100 border-2 border-red-500">
      <section className="flex flex-col md:grid md:items-center border-2 border-blue-500" style={{gridTemplateColumns: '1fr 1.5fr 1fr'}}>
        {/* LEFT VISUALS */}
        <div className="overflow-hidden h-[300px] sm:h-[300px] lg:h-[300px] xl:h-[350px] order-1 md:order-none flex items-center justify-center border-2 border-green-500">
          <Image 
            src="/images/landing_page/3Cats.svg" 
            alt="Three cats" 
            width={300} 
            height={300} 
            className="pointer-events-none select-none object-contain border-2 border-red-500"
          />
        </div>

        {/* CENTER TEXT */}
        <div className="text-center px-2 py-4 sm:px-4 lg:px-1 order-2 md:order-none border-2 border-yellow-500">
          <h1 className="font-bold leading-tight mb-4 sm:mb-6 lg:mb-8 text-4xl md:text-5xl lg:text-6xl">
            <span className="block text-black border-2 border-red-500">Pet Sitter<span className="text-orange-500">,</span></span>
            <span className="block text-black">Perfect<span className="text-sky-300">,</span></span>
            <span className="block text-black">For Your Pet<span className="text-pet-accent-yellow">.</span></span>
          </h1>
          <p className="mt-2 sm:mt-4 lg:mt-5 text-base h4 text-gray-6 max-w-lg mx-auto leading-relaxed font-sans">
            Find your perfect pet sitter with us.
          </p>
        </div>

        {/* RIGHT VISUALS */}
        <div className="overflow-hidden h-[290px] sm:h-[300px] lg:h-[300px] xl:h-[350px] order-3 md:order-none flex items-center justify-center border-2 border-blue-500">
          <Image 
            src="/images/landing_page/GlassesDog.svg" 
            alt="Dog" 
            width={300} 
            height={300} 
            className="pointer-events-none select-none object-contain border-2 border-red-500"
          />
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
