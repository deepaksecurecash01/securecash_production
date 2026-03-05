import VideoSection from "@/components/common/VideoSection";
import ContentSection from "./ContentSection";
import CounterSection from "./CounterSection";

const MidBanner = () => {
  return (
    <>
      <CounterSection />
      <ContentSection />
      <VideoSection height="630px" />
    </>
  );
};

export default MidBanner;
