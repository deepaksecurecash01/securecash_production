import { type ReactNode, type CSSProperties } from "react";


type ContainerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
};

const Container = ({
  children,
  className = "",
  style = {},
  id,
}: ContainerProps) => {
  return (
    <div
      id={id}
      className={`max-w-[1366px] mx-auto ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Container;
