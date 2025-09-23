import React from "react";
import Image from "next/image";

interface SectionData {
  id: number;
  imageSrc: string;
  imageAlt: string;
  title: string;
  titleColor: string;
  description: string;
}

const ThreeSectionLayout = () => {
  const sections: SectionData[] = [
    {
      id: 1,
      imageSrc: "/images/landing_page/CuddleCat.svg", // Using existing image as placeholder
      imageAlt: "Woman holding a cat",
      title: "Connect With Sitters",
      titleColor: "text-green-600",
      description: "Find a verified and reviewed sitter who'll keep your pets company and give time."
    },
    {
      id: 2,
      imageSrc: "/images/landing_page/DogCat.svg", // Using existing image as placeholder
      imageAlt: "Dog and cat together",
      title: "Better For Your Pets",
      titleColor: "text-blue-500",
      description: "Pets stay happy at home with a sitter who gives them loving care and companionship."
    },
    {
      id: 3,
      imageSrc: "/images/landing_page/DogCare.svg", // Using existing image as placeholder
      imageAlt: "Woman petting a dog",
      title: "Calling All Pets",
      titleColor: "text-orange-500",
      description: "Stay for free with adorable animals in unique homes around the world."
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 border-2 border-blue-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-8 lg:gap-16">
        {sections.map((section) => (
          <div key={section.id} className="text-center border-2 border-red-500">
            {/* Circular Image */}
            <div className="w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48 mx-auto mb-8 sm:mb-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={section.imageSrc}
                alt={section.imageAlt}
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Title with colored word */}
            <h2 className="text-xl sm:text-xl lg:text-2xl font-bold text-black mb-6 sm:mb-8 leading-tight">
              <span className={section.titleColor}>
                {section.title.split(' ')[0]}
              </span>
              <span className="text-black">
                {' ' + section.title.split(' ').slice(1).join(' ')}
              </span>
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg lg:text-xl max-w-sm mx-auto">
              {section.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreeSectionLayout;
