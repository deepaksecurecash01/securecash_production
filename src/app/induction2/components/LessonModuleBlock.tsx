import { InductionModule } from "@/data/induction-content";
import LessonVideo from "./LessonVideo";

interface LessonModuleBlockProps {
  block: InductionModule;
  index: number;
}

const LessonModuleBlock = ({ block, index }: LessonModuleBlockProps) => {
  if (block.type === "text") {
    return (
      <div
        key={index}
        className="induction-content-wrap"
        style={{ padding: "0" }}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  }

  if (block.type === "video") {
    return (
      <div key={index} className="mb-8 mt-8">
        <LessonVideo videoId={block.videoId} />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div key={index} className="my-8 flex justify-center">
        <img
          src={block.src}
          alt={block.alt || "Lesson Image"}
          className="max-w-full h-auto rounded-md shadow-sm"
        />
      </div>
    );
  }

  // QuizModule (type === "quiz") is part of InductionModule but rendered
  // separately via QuizEngine — nothing to render inline here.
  return null;
};

export default LessonModuleBlock;
