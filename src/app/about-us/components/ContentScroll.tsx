interface ContentScrollProps {
  sectionContent: string[];
}

const ContentScroll = ({ sectionContent }: ContentScrollProps) => {
  return (
    <ul className="list-none w-full">
      {sectionContent.map((paragraph, index) => (
        <li key={index}>
          <p
            className={`text-left font-light leading-8 ${
              index !== sectionContent.length - 1 && "mb-4"
            } 414px:pr-0 font-montserrat`}
          >
            {paragraph}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default ContentScroll;
