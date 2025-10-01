import { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import type { Swiper as SwiperType } from "swiper";
import type { NavigationOptions } from "swiper/types";


import "swiper/css";
import "swiper/css/navigation";

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    if (!swiperRef.current) return;

    const swiper = swiperRef.current;

    // เช็คว่า navigation เป็น object ไม่ใช่ boolean
    if (typeof swiper.params.navigation !== "boolean") {
      const navigation = swiper.params.navigation as NavigationOptions;

      navigation.prevEl = prevRef.current;
      navigation.nextEl = nextRef.current;

      swiper.navigation.destroy();
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, []);

  return (
    <div className="relative mt-6 w-full">
      <Swiper
        modules={[Navigation]}
        loop
        centeredSlides
        spaceBetween={16}
        breakpoints={{
          375: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1440: { slidesPerView: 3 },
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {images.length > 0 ? (
          images.map((src, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-[281px] md:h-[360px] lg:h-[413px] overflow-hidden rounded-sm">
                <Image
                  src={src}
                  alt={`slide-${index}`}
                  fill
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="flex h-[281px] items-center justify-center bg-gray-100 text-gray-500 rounded-sm">
              No images available
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      {/* ปุ่ม Prev */}
      <button
        ref={prevRef}
        className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 
          items-center justify-center rounded-full bg-white/70 shadow 
          hover:bg-orange-500 hover:text-white transition"
      >
        <Image
          src="/icons/arrow-left.svg"
          alt="prev"
          width={20}
          height={20}
          className="w-auto h-auto"
        />
      </button>

      {/* ปุ่ม Next */}
      <button
        ref={nextRef}
        className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 
          items-center justify-center rounded-full bg-white/70 shadow 
          hover:bg-orange-500 hover:text-white transition"
      >
        <Image
          src="/icons/arrow-right.svg"
          alt="next"
          width={20}
          height={20}
          className="w-auto h-auto"
        />
      </button>
    </div>
  );
}
