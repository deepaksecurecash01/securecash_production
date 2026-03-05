"use client";
import React from "react";
import { FaCircle } from "react-icons/fa";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface BulletItem {
  /** Main text content of the bullet */
  text: React.ReactNode;
}

interface IcaBulletListProps {
  items: BulletItem[];
  /** Gap between items. Default: "space-y-4" */
  spacing?: "space-y-2" | "space-y-4" | "space-y-6";
  /** Text size. Default: "text-sm" */
  textSize?: "text-sm" | "text-base";
  /** Text color. Default: "text-gray-600" */
  textColor?: string;
  /** Wrapper className */
  className?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * IcaBulletList
 *
 * A <ul> with small gold FaCircle markers and indented <p> text.
 * This exact pattern (absolute-positioned dot + pl-4 paragraph) appears in:
 *   - DeedOfGuaranteeSection  (3 recital items)
 *   - DriversSection          (7 eDockets benefit items)
 *
 * Items accept ReactNode so rich text (bold, links) can be passed inline.
 */
const IcaBulletList = ({
  items,
  spacing = "space-y-4",
  textSize = "text-sm",
  textColor = "text-gray-600",
  className = "",
}: IcaBulletListProps) => (
  <ul className={`list-none ml-6 ${spacing} ${className}`} role="list">
    {items.map((item, index) => (
      <li key={index} className="relative">
        <FaCircle
          className="text-primary text-[8px] mr-3 flex-shrink-0 absolute top-1"
          aria-hidden="true"
        />
        <p className={`pl-4 ${textSize} ${textColor}`}>{item.text}</p>
      </li>
    ))}
  </ul>
);

export default IcaBulletList;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// DeedOfGuaranteeSection — recitals:
//   <IcaBulletList
//     items={[
//       { text: "The Beneficiary at item 2 of the Schedule has agreed to engage..." },
//       { text: "The Guarantor at item 4 of the Schedule agrees to guarantee..." },
//       { text: "In consideration of the Guarantor entering into this deed..." },
//     ]}
//     textSize="text-base"
//   />
//
// DriversSection — eDockets benefits:
//   <IcaBulletList
//     items={[
//       { text: "One App login for your Staff (Operators)..." },
//       { text: "Transparency for the locations you service..." },
//       { text: <><strong>Does not cost you anything</strong> and provides...</> },
//       // ...more items
//     ]}
//   />
