import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// index signature uses unknown (not any) — formData originates from req.json()
// Callers must narrow individual fields before use.
interface ExecutedAgreementData {
  "Date of Acceptance"?: string;
  [key: string]: unknown;
}

interface DrawFormRowOptions {
  label: string;
  value: string;
  x: number;
  y: number;
  width?: number;
}

// Helper to fetch assets over the network instead of using 'fs'.
// Uses VERCEL_URL in production, falls back to localhost in development.
const fetchAsset = async (assetPath: string): Promise<ArrayBuffer> => {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const response = await fetch(`${baseUrl}/${assetPath}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${assetPath}: ${response.statusText}`);
  }
  return response.arrayBuffer();
};

/**
 * Generates the Executed Agreement PDF with the customer's details and signature
 * overlaid onto the SecureCash Terms template.
 *
 * @returns A base64-encoded PDF string, or null if generation fails.
 */
export const generateExecutedAgreement = async (
  formData: ExecutedAgreementData,
): Promise<string | null> => {
  try {
    // ── 1. LOAD TEMPLATE ──────────────────────────────────────────────────────
    const pdfBuffer = await fetchAsset("upload/SecureCash_Terms_Dynamic.pdf");
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.registerFontkit(fontkit);

    // ── 2. EMBED FONTS ────────────────────────────────────────────────────────
    let regularFont: Awaited<ReturnType<typeof pdfDoc.embedFont>>;
    let boldFont: Awaited<ReturnType<typeof pdfDoc.embedFont>>;

    try {
      // Fetch fonts concurrently for speed
      const [regularBytes, boldBytes] = await Promise.all([
        fetchAsset("fonts/montserrat/Montserrat-Regular.ttf"),
        fetchAsset("fonts/montserrat/Montserrat-Bold.ttf"),
      ]);
      regularFont = await pdfDoc.embedFont(regularBytes);
      boldFont = await pdfDoc.embedFont(boldBytes);
    } catch (e) {
      console.warn(
        "Custom fonts missing or failed to load, falling back to Helvetica",
        e,
      );
      const { StandardFonts } = await import("pdf-lib");
      regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    // ── HELPER: Form Row Drawer ───────────────────────────────────────────────
    // PDFPage is the correct type from pdf-lib — replaces the previous `any`.
    const drawFormRow = (
      page: PDFPage,
      { label, value, x, y, width = 200 }: DrawFormRowOptions,
    ): void => {
      const fontSize = 12;

      // 1. Label (BOLD)
      page.drawText(label, {
        x,
        y,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Calculate start of underline
      const labelWidth = boldFont.widthOfTextAtSize(label, fontSize);
      const lineStartX = x + labelWidth + 3;
      const lineWidth = width - labelWidth - 2;

      // 2. Value (REGULAR)
      if (value) {
        page.drawText(value, {
          x: lineStartX + 3,
          y: y + 2,
          size: fontSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      }

      // 3. Underline
      page.drawLine({
        start: { x: lineStartX + 3, y: y - 2 },
        end: { x: lineStartX + lineWidth, y: y - 2 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
    };

    // ── 3. PAGE 2 — DYNAMIC PARAGRAPH ────────────────────────────────────────
    const page2 = pdfDoc.getPages()[1];

    // Narrow each field from unknown to string before interpolation
    const fullName =
      typeof formData["Full Name"] === "string" ? formData["Full Name"] : "";
    const orgRole =
      typeof formData["Organisation Role"] === "string"
        ? formData["Organisation Role"]
        : "";
    const orgName =
      typeof formData["Organisation Name"] === "string"
        ? formData["Organisation Name"]
        : "";
    const orgAbn =
      typeof formData["Organisation ABN"] === "string"
        ? formData["Organisation ABN"]
        : "";
    const email =
      typeof formData["Email"] === "string" ? formData["Email"] : "";
    const birthday =
      typeof formData["Birthday"] === "string" ? formData["Birthday"] : "";
    const signature =
      typeof formData["Signature"] === "string" ? formData["Signature"] : "";
    const dateOfAcceptance =
      typeof formData["Date of Acceptance"] === "string"
        ? formData["Date of Acceptance"]
        : "";

    const dynamicText = `${fullName} (${orgRole}) of ${orgName} ABN ${orgAbn} (Customer) together with the Principal and the Customer are referred to as "the Parties")`;

    page2.drawText(dynamicText, {
      x: 38,
      y: 505,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
      maxWidth: 500,
      lineHeight: 16,
    });

    // ── 4. PAGE 11 — EXECUTION FORM ───────────────────────────────────────────
    const page11 = pdfDoc.getPages()[10];
    const startY = 580;
    const col1X = 38;
    const col2X = 320;
    const rowHeight = 50;

    // Row 1
    drawFormRow(page11, {
      label: "Name:",
      value: fullName,
      x: col1X,
      y: startY,
      width: 250,
    });
    drawFormRow(page11, {
      label: "Position:",
      value: orgRole,
      x: col2X,
      y: startY,
      width: 220,
    });

    // Row 2
    drawFormRow(page11, {
      label: "Email:",
      value: email,
      x: col1X,
      y: startY - rowHeight,
      width: 250,
    });
    drawFormRow(page11, {
      label: "DOB:",
      value: birthday,
      x: col2X,
      y: startY - rowHeight,
      width: 150,
    });

    // Row 3
    drawFormRow(page11, {
      label: "Company:",
      value: orgName,
      x: col1X,
      y: startY - rowHeight * 2,
      width: 250,
    });
    drawFormRow(page11, {
      label: "ABN:",
      value: orgAbn,
      x: col2X,
      y: startY - rowHeight * 2,
      width: 150,
    });

    // Row 4 — Signature area
    const sigY = startY - rowHeight * 4;

    page11.drawText("Signature:", {
      x: col1X,
      y: sigY,
      size: 12,
      font: boldFont,
    });
    page11.drawLine({
      start: { x: col1X + 70, y: sigY - 2 },
      end: { x: col1X + 250, y: sigY - 2 },
      thickness: 0.5,
    });

    // ── SIGNATURE PROCESSING ─────────────────────────────────────────────────
    if (signature) {
      try {
        // Strip data URI prefix (e.g. "data:image/png;base64,") if present
        const sigData = signature.includes(",")
          ? signature.split(",")[1]
          : signature;

        const sigImage = await pdfDoc.embedPng(sigData);

        // Scale signature to fit within max dimensions while preserving aspect ratio
        const maxWidth = 160;
        const maxHeight = 60;
        const widthScale = maxWidth / sigImage.width;
        const heightScale = maxHeight / sigImage.height;
        const finalScale = Math.min(widthScale, heightScale);
        const sigWidth = sigImage.width * finalScale;
        const sigHeight = sigImage.height * finalScale;

        page11.drawImage(sigImage, {
          x: col1X + 75,
          y: sigY - sigHeight + 60,
          width: sigWidth,
          height: sigHeight,
        });
      } catch (err) {
        console.error("Failed to embed signature:", err);
        page11.drawText("/s/ Digital Signature (Error)", {
          x: col1X + 75,
          y: sigY + 2,
          size: 10,
          font: regularFont,
          color: rgb(0.4, 0.4, 0.4),
        });
      }
    } else {
      page11.drawText("/s/ Digital Signature", {
        x: col1X + 75,
        y: sigY + 2,
        size: 10,
        font: regularFont,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Date & Time — split from a "DD/MM/YYYY, HH:MM:SS" string
    const parts = dateOfAcceptance.split(",");
    const dateValue = parts[0]?.trim() ?? "";
    const timeValue = parts[1]?.trim() ?? "";

    drawFormRow(page11, {
      label: "Date:",
      value: dateValue,
      x: col2X,
      y: sigY,
      width: 110,
    });
    drawFormRow(page11, {
      label: "Time:",
      value: timeValue,
      x: col2X + 120,
      y: sigY,
      width: 110,
    });

    // ── 5. SAVE ───────────────────────────────────────────────────────────────
    return await pdfDoc.saveAsBase64();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return null;
  }
};
