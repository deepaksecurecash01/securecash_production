import BannerInfo from "@/app/home/components/HeroSection/BannerInfo";
import BannerSlider, { type Slide } from "./BannerSlider";
import "./BannerSlider.css";

const SLIDES: Slide[] = [
  {
    mobile: "/images/slider/Slide-1-mobile.avif",
    tablet: "/images/slider/Slide-1-tablet.avif",
    web: "/images/slider/Slide-1-web.avif",
    heading: "Let Us Do Your Banking,",
    subHeading: "Don't Take The Risk!",
    text: "Anywhere. Anytime. Australia Wide.",
    buttonText: "Explore Our Services",
    buttonLink: "#welcome",
    alt: "SecureCash Banking Services - Australia Wide",
  },
  {
    mobile: "/images/slider/Slide-2-mobile.avif",
    tablet: "/images/slider/Slide-2-tablet.avif",
    web: "/images/slider/Slide-2-web.avif",
    heading: "Start Taking Advantage Of Our Services Today",
    subHeading: "Get A Quote From SecureCash",
    text: "We Just Need A Few Details!",
    buttonText: "Get a Quote",
    buttonLink: "/quote",
    alt: "Get a Quote from SecureCash",
  },
  {
    mobile: "/images/slider/Slide-3-mobile.avif",
    tablet: "/images/slider/Slide-3-tablet.avif",
    web: "/images/slider/Slide-3-web.avif",
    heading: "We're Pushing Our Industry Into The Future",
    subHeading: "Take Advantage Of Our eDockets System",
    text: "Control Your Services With A Click Of A Button",
    buttonText: "Discover eDockets",
    buttonLink: "https://www.edockets.app/",
    alt: "eDockets System - Digital Cash Management",
  },
  {
    mobile: "/images/slider/Slide-4-mobile.avif",
    tablet: "/images/slider/Slide-4-tablet.avif",
    web: "/images/slider/Slide-4-web.avif",
    heading: "Our Services Are Covert",
    subHeading: "We Don't Attract Unwanted Attention",
    text: "A Safer Solution For Your Business",
    buttonText: "About Our Security",
    buttonLink: "/about-us#about-us-section-service",
    alt: "Covert Cash Transport Services",
  },
  {
    mobile: "/images/slider/Slide-5-mobile.avif",
    tablet: "/images/slider/Slide-5-tablet.avif",
    web: "/images/slider/Slide-5-web.avif",
    heading: "Use A Provider You Can Trust",
    subHeading: "We Have Been Over 25 Years",
    text: "Our Managers Have Over 100 Years Combined Industry Experience",
    buttonText: "About Us",
    buttonLink: "/about-us",
    alt: "Trusted Cash Transport Provider - 25+ Years Experience",
  },
];

const HeroSection = () => (
  <section
    id="banner"
    className="flex flex-col justify-end items-center"
    aria-label="Hero banner"
  >
    <BannerSlider slides={SLIDES} />
    <BannerInfo />
  </section>
);

export default HeroSection;
