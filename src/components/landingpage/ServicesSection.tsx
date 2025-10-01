import React from "react";
import Image from "next/image";

interface Service {
  id: number;
  title: string;
  description: string;
  iconSrc: string;
}

const ServicesSection = () => {
  const services: Service[] = [
    {
      id: 1,
      title: "Boarding",
      description: "Your pets stay overnight in your sitter's home. They'll be treated like part of the family in a comfortable environment.",
      iconSrc: "/icons/BlueStar.svg"
    },
    {
      id: 2,
      title: "House Sitting",
      description: "Your sitter takes care of your pets and your home. Your pets will get all the attention they need without leaving home.",
      iconSrc: "/icons/PinkStar.svg"
    },
    {
      id: 3,
      title: "Dog Walking",
      description: "Your dog gets a walk around your neighborhood. Perfect for busy days and dogs with extra energy to burn.",
      iconSrc: "/icons/GreenStar.svg"
    },
    {
      id: 4,
      title: "Drop-In Visits",
      description: "Your sitter drops by your home to play with your pets, offer food, and give potty breaks or clean the litter box.",
      iconSrc: "/icons/YellowStar.svg"
    }
  ];

  return (
    <div className="flex flex-col justify-evenly gap-4 h-full">
        {services.map((service) => (
          <div key={service.id} className="flex items-start space-x-4">
            {/* Star Icon */}
            <div className="w-6 h-6 flex-shrink-0 mt-1">
              <Image 
                src={service.iconSrc} 
                alt={`${service.title} icon`}
                width={24}
                height={24}
                className="object-contain"
                style={{ width: '24px', height: '24px' }}
              />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="h3 font-bold text-black mb-2">
                {service.title}
              </h3>
              <p className="body-sm text-gray-6 leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ServicesSection;