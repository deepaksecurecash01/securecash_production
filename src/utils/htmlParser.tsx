import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import { JSX } from "react";

const options: HTMLReactParserOptions = {
  replace: (node: DOMNode): JSX.Element | string | null | undefined | false => {
    if (!(node instanceof Element)) return undefined;

    if (node.name === "a") {
      const { href, class: className, target, rel } = node.attribs;
      const children = domToReact(node.children as DOMNode[], options);

      const isExternal = !!href && href.startsWith("http");
      const isSpecial =
        !href ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:") ||
        href.startsWith("#");

      if (isSpecial || isExternal) {
        return (
          <a
            href={href}
            className={className}
            target={isExternal ? (target ?? "_blank") : undefined}
            rel={isExternal ? (rel ?? "noopener noreferrer") : undefined}
          >
            {children}
          </a>
        );
      }

      return (
        <Link href={href} className={className} target={target} rel={rel}>
          {children}
        </Link>
      );
    }

    if (node.name === "img") {
      const { src, alt, width, height, class: className } = node.attribs;

      const parsedWidth = parseInt(width);
      const parsedHeight = parseInt(height);

      return (
        <div className="relative w-full h-auto my-8">
          <Image
            src={src}
            alt={alt || "Blog image"}
            width={Number.isFinite(parsedWidth) ? parsedWidth : 900}
            height={Number.isFinite(parsedHeight) ? parsedHeight : 600}
            className={`h-auto w-full object-cover ${className ?? ""}`}
            sizes="(max-width: 768px) 100vw, 900px"
          />
        </div>
      );
    }

    return undefined;
  },
};

export const parseHtml = (content: string | null | undefined) => {
  if (!content) return null;
  return parse(content, options);
};
