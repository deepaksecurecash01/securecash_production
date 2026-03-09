"use client";
import VimeoLite from "@/components/common/VimeoLite";

interface LessonVideoProps {
  videoId?: string | null;
}

const LessonVideo = ({ videoId }: LessonVideoProps) => {
  if (!videoId) return null;

  return (
    <div className="w-full mb-8">
      <div className="aspect-video bg-gray-200 rounded-sm flex items-center justify-center">
        <div className="video-player rounded-lg overflow-hidden w-full h-full shadow-lg">
          <VimeoLite videoId={videoId} />
        </div>
      </div>
    </div>
  );
};

export default LessonVideo;
