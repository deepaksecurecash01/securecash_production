import { type ReactNode, type CSSProperties } from "react";


type ScrollableSectionProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const ScrollableSection = ({
  children,
  className = "",
  style = {},
}: ScrollableSectionProps) => {
  return (
    <div className={`custom-scrollbar ${className}`} style={style}>
      {children}
    </div>
  );
};

export default ScrollableSection;
