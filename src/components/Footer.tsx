import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { satoshi } from "@/fonts";

const Footer = () => {
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (router.pathname === '/') {
      // ถ้าอยู่หน้า / อยู่แล้ว ให้เลื่อนไปด้านบนสุดด้วย smooth scroll
      window.scrollTo(0, 0);
      
      // วิธีเสริมเพื่อให้แน่ใจ
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } else {
      // ถ้าอยู่หน้าอื่น ให้ไปหน้า / และเลื่อนไปด้านบนสุด
      window.location.href = '/';
    }
  };

  return (
    <footer>
      <div className={`${satoshi.className} bg-black`}>
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <button onClick={handleLogoClick}>
              <div className="flex-shrink-0 hover:opacity-80 transition-opacity duration-300 cursor-pointer">
                <Image
                  src="/images/landing_page/logoFooter.svg"
                  alt="Logo"
                  width={180}
                  height={100}
                  className="object-contain"
                  style={{ width: '120px', height: 'auto' }}
                  priority
                />
              </div>
            </button>
          </div>

          {/* Tagline */}
          <p className="text-white text-lg sm:text-xl lg:text-2xl text-center font-medium">
            Find your perfect pet sitter with us.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
