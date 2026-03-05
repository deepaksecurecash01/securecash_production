"use client";
import Container from "@/components/layout/Container";
import { memo, useCallback, useState } from "react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import BannerContent, { type BannerContentProps } from "./BannerContent";

export interface Slide extends BannerContentProps {
  mobile: string;
  tablet: string;
  web: string;
  alt?: string;
}

interface BannerSlideProps {
  slide: Slide;
  slideIndex: number;
}

const BannerSlide = memo(({ slide, slideIndex }: BannerSlideProps) => {
  // Optimization: Only prioritize loading for the first slide (LCP)
  const isLCP = slideIndex === 0;

  return (
    <div className="relative overflow-hidden bg-black h-full">
      <div className="absolute inset-0 bg-black/50 z-[1]" aria-hidden="true" />

      <div className="relative w-full h-full min-h-[480px] 414px:min-h-[490px] 768px:min-h-[600px] 1024px:h-full 1440px:min-h-[70vh]">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={slide.mobile}
            type="image/avif"
          />
          <source
            media="(min-width: 768px) and (max-width: 1023px)"
            srcSet={slide.tablet}
            type="image/avif"
          />
          <source
            media="(min-width: 1024px)"
            srcSet={slide.web}
            type="image/avif"
          />
          <img
            src={slide.web}
            alt={slide.alt || `SecureCash Banner ${slideIndex + 1}`}
            decoding={isLCP ? "sync" : "async"}
            loading={isLCP ? "eager" : "lazy"}
            fetchPriority={isLCP ? "high" : "low"}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center" }}
          />
        </picture>
      </div>

      <Container className="z-10 w-full absolute inset-0 flex items-center">
        <BannerContent {...slide} />
      </Container>
    </div>
  );
});

BannerSlide.displayName = "BannerSlide";

interface CustomPaginationProps {
  slides: Slide[];
  activeIndex: number;
  onDotClick: (index: number) => void;
}

const CustomPagination = ({
  slides,
  activeIndex,
  onDotClick,
}: CustomPaginationProps) => (
  <div
    className="inner-controls absolute w-5 h-[68px] z-10 top-[calc(50%-80px)] right-0 cursor-default ml-auto mr-0 320px:w-[40px] 768px:right-0 992px:mr-[30px] 1200px:right-0 pointer-events-none"
    role="group"
    aria-label="Slide navigation"
  >
    <ul className="dot-navigation absolute top-[32%] list-none m-0 p-0 pointer-events-auto">
      {slides.map((_, index) => (
        <li key={index}>
          <button
            className={`cursor-pointer h-[15px] w-[15px] mx-[2px] rounded-full inline-block transition-all duration-300 border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              activeIndex === index
                ? "bg-white transform scale-[1.34]"
                : "bg-[#a3a3a3]"
            }`}
            onClick={() => onDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={activeIndex === index}
          />
        </li>
      ))}
    </ul>
  </div>
);

const BannerSlider = ({ slides = [] }: { slides: Slide[] }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(
    null,
  );

  const handleSlideChange = useCallback((swiper: SwiperClass) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  const handleSwiper = useCallback((swiper: SwiperClass) => {
    setSwiperInstance(swiper);
  }, []);

  const handleDotClick = useCallback(
    (index: number) => {
      swiperInstance?.slideToLoop(index);
    },
    [swiperInstance],
  );

  if (slides.length === 0) return null;

  return (
    <div
      id="banner-slider"
      className="w-full relative overflow-hidden bg-black"
      role="region"
      aria-label="Hero banner carousel"
    >
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={slides.length > 1}
        onSwiper={handleSwiper}
        onSlideChange={handleSlideChange}
        className="w-full bg-black"
        aria-live="off"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <BannerSlide slide={slide} slideIndex={index} />
          </SwiperSlide>
        ))}
      </Swiper>

      <CustomPagination
        slides={slides}
        activeIndex={activeIndex}
        onDotClick={handleDotClick}
      />
    </div>
  );
};

export default BannerSlider;
