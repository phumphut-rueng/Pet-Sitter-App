import React from "react";

const HeroSection = () => {
  return (
    <div className="container mx-auto px-20 sm:px-6 lg:px-8 py-10 overflow-hidden">
      <section className="grid grid-cols-12 items-center gap-4 sm:gap-6">
        {/* LEFT VISUALS */}
        <div className="relative col-span-12 md:col-span-4 overflow-hidden max-h-[200px] min-h-[200px] sm:min-h-[360px] md:min-h-[300px] lg:min-h-[360px] border-2 border-red-500">
          <img src="/icons/Ellipse-15.svg" alt="Yellow quarter" className="pointer-events-none select-none absolute left-0 md:top-[20%] lg:top-[15%] top-[15%] w-[18%] sm:w-[20%] md:w-[22%] lg:w-[24%] max-w-none"/>
          <img src="/icons/PinkPaw.svg" alt="Paw" className="pointer-events-none select-none absolute right-[2%] top-[6%] w-[20%] sm:w-[22%] md:w-[24%] lg:w-[25%] max-w-none"/>
          <img src="/icons/3Cats.svg" alt="Three cats" className="pointer-events-none select-none absolute left-[22%] md:left-[25%] lg:left-[20%] bottom-0 w-[50%] sm:w-[50%] md:w-[70%] lg:w-[60%] max-w-none"/>
          <img src="/icons/Frame-427320928.svg" alt="Bubble" className="pointer-events-none select-none absolute left-[18%] md:left-[20%] top-[40%] sm:top-[38%] md:top-[40%] lg:top-[38%] lg:left-[18%] w-[12%] sm:w-[14%] md:w-[15%] lg:w-[16%] max-w-none"/>
        </div>

        {/* CENTER TEXT */}
        <div className="col-span-12 md:col-span-4 text-center px-2 border-2 border-blue-500">
          <h1 className="font-bold leading-tight mb-4 sm:mb-6 text-[28px] sm:text-5xl md:text-4xl lg:text-6xl">
            <span className="block text-black">Pet Sitter<span className="text-orange-500">,</span></span>
            <span className="block text-black">Perfect<span className="text-sky-300">,</span></span>
            <span className="block text-black">For Your Pet<span className="text-pet-accent-yellow">.</span></span>
          </h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto">
            Find your perfect pet sitter with us.
          </p>
        </div>

        {/* RIGHT VISUALS */}
        <div className="relative col-span-12 md:col-span-4 overflow-hidden max-h-[200px] min-h-[200px] sm:min-h-[360px] md:min-h-[300px] lg:min-h-[360px] border-2 border-green-500">
          <img src="/icons/OrangeStar.svg" alt="Star" className="pointer-events-none select-none absolute left-[4%] top-[6%] w-[16%] sm:w-[18%] md:w-[20%] lg:w-[22%] max-w-none"/>
          <img src="/icons/GlassesDog.svg" alt="Dog" className="pointer-events-none select-none absolute right-[4%] top-[20%] w-[45%] sm:w-[50%] md:w-[55%] lg:w-[60%] max-w-none"/>
          <img src="/icons/EllipseGrey.svg" alt="Grey circle" className="pointer-events-none select-none absolute left-[14%] bottom-[25%] w-[8%] sm:w-[9%] md:w-[10%] lg:w-[11%] max-w-none"/>
          <img src="/icons/EllipseGreen.svg" alt="Green arch" className="pointer-events-none select-none absolute left-[6%] bottom-0 w-[60%] sm:w-[65%] md:w-[70%] lg:w-[75%] max-w-none"/>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
