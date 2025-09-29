    import { useRef, useEffect } from "react";
    import { Swiper, SwiperSlide } from "swiper/react";
    import { Navigation } from "swiper/modules";
    import Image from "next/image";

    import "swiper/css";
    import "swiper/css/navigation";

    const images = [
    "/images/sitters/test1.svg",
    "/images/sitters/test2.svg",
    "/images/sitters/test3.svg",
    "/images/sitters/test1.svg",
    "/images/sitters/test2.svg",
    ];

    export default function ImageCarousel() {
    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);
    const swiperRef = useRef<any>(null);

    useEffect(() => {
        if (
        swiperRef.current &&
        swiperRef.current.params &&
        swiperRef.current.params.navigation
        ) {
        swiperRef.current.params.navigation.prevEl = prevRef.current;
        swiperRef.current.params.navigation.nextEl = nextRef.current;

        swiperRef.current.navigation.destroy();
        swiperRef.current.navigation.init();
        swiperRef.current.navigation.update();
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
            {images.map((src, index) => (
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
          
          
            ))}
        </Swiper>

        {/* ปุ่ม Prev */}
        <button
            ref={prevRef}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 
             items-center justify-center rounded-full bg-white/70 shadow 
             hover:bg-orange-5 hover:text-white transition"
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
             hover:bg-orange-5 hover:text-white transition"
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
