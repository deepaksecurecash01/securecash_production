import CompaniesSlider from "@/components/common/CompaniesSlider";
import FormSection from "./components/FormSection";
import HeroSection from "./components/HeroSection";
import MidBanner from "./components/MidBanner";
import ServicesSection from "./components/ServicesSection";
import TeamContent from "./components/TeamSection";
import WelcomeSection from "./components/WelcomeSection";

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <WelcomeSection />
      <MidBanner />
      <FormSection />
      <ServicesSection />
      <TeamContent />
      <CompaniesSlider />
    </div>
  );
}
