import { type InductionModule } from "@/data/induction-content";
import LessonVideo from "./LessonVideo";

interface LessonModuleBlockProps {
  block: InductionModule;
  // `index` removed — key is set at the call site by the parent, not inside
  // the component. Passing index as a prop had no effect.
}

const LessonModuleBlock = ({ block }: LessonModuleBlockProps) => {
  if (block.type === "text") {
    return (
      <div
        className="induction-content-wrap"
        style={{ padding: "0" }}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  }

  if (block.type === "video") {
    return (
      <div className="mb-8 mt-8">
        <LessonVideo videoId={block.videoId} />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div className="my-8 flex justify-center">
        <img
          src={block.src}
          alt={block.alt ?? "Lesson image"}
          className="max-w-full h-auto rounded-md shadow-sm"
        />
      </div>
    );
  }

  // QuizModule (type === "quiz") is rendered separately via QuizEngine.
  return null;
};

export default LessonModuleBlock;
