import React from "react";

interface DividerProps {
  alignment?: "left" | "center" | "right";
  margin?: string;
}

const Divider = ({
  alignment = "center",
  margin = "mt-[20px]",
}: DividerProps) => {
  const style: React.CSSProperties = {
    width: "100px",
    height: "4px",
    borderRadius: "5px",
    backgroundColor: "var(--color-primary, #c6a54b)",
    marginLeft:
      alignment === "left" ? 0 : alignment === "right" ? "auto" : "auto",
    marginRight:
      alignment === "left" ? "auto" : alignment === "right" ? 0 : "auto",
  };

  return <hr className={`border-0 m-0 text-left ${margin}`} style={style} />;
};

interface IcaSectionTitleProps {
  children: React.ReactNode;
  Icon?: React.ElementType;
  position?: "left" | "center";
}

const IcaSectionTitle = ({
  children,
  Icon,
  position = "center",
}: IcaSectionTitleProps) => (
  <div className="mb-2">
    <div
      className={`flex items-center gap-3 mb-4 ${
        position === "left"
          ? "justify-center 1024px:justify-start"
          : "justify-center"
      }`}
    >
      {Icon && <Icon className="min-w-[24px] text-[24px] text-primary" />}
      <h3 className="text-[26px] font-semibold text-gray-800">{children}</h3>
    </div>
    <Divider alignment={position === "left" ? "left" : "center"} />
  </div>
);

export default IcaSectionTitle;
