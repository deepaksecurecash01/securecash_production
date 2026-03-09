import fs from "fs";
import path from "path";
import { PDF_FILES_TO_CACHE } from "../config/constants";

const PDF_CACHE = new Map<string, string>();
const PDF_CACHE_INITIALIZED = { value: false };
let pdfCacheTotalBytes = 0; // ← running counter, incremented on every write

export const initializePdfCache = (): void => {
  if (PDF_CACHE_INITIALIZED.value) return;

  const startTime = performance.now();
  let cachedCount = 0;

  PDF_FILES_TO_CACHE.forEach((filename) => {
    try {
      const filePath = path.join(process.cwd(), "public", "upload", filename);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const base64Content = fileBuffer.toString("base64");
        PDF_CACHE.set(filename, base64Content);
        cachedCount++;
        pdfCacheTotalBytes += base64Content.length; // ← increment here
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`Error caching PDF ${filename}:`, err.message);
    }
  });

  const initTime = performance.now() - startTime;
  const sizeMB = (pdfCacheTotalBytes / (1024 * 1024)).toFixed(2);

  console.log(
    `PDF cache: ${cachedCount}/${PDF_FILES_TO_CACHE.length} files, ${sizeMB}MB, ${initTime.toFixed(2)}ms`,
  );

  PDF_CACHE_INITIALIZED.value = true;
};

export const readPdfFile = (filename: string): string | null => {
  if (PDF_CACHE.has(filename)) {
    return PDF_CACHE.get(filename) ?? null;
  }

  try {
    const filePath = path.join(process.cwd(), "public", "upload", filename);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const fileBuffer = fs.readFileSync(filePath);
    const base64Content = fileBuffer.toString("base64");
    PDF_CACHE.set(filename, base64Content);
    pdfCacheTotalBytes += base64Content.length; // ← increment here too (cache miss path)
    return base64Content;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`Error reading PDF file ${filename}:`, err.message);
    return null;
  }
};

export const getPdfCacheStatus = () => ({
  initialized: PDF_CACHE_INITIALIZED.value,
  cachedFiles: PDF_CACHE.size,
  cacheSize: `${(pdfCacheTotalBytes / (1024 * 1024)).toFixed(2)}MB`, // ← O(1) read
});
