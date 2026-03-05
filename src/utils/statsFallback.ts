import fs from "fs/promises";
import path from "path";

const FALLBACK_PATH = path.join(process.cwd(), "src/data/stats-fallback.json");

interface StatsData {
  customers: number;
  servicesPerformed: number;
  cashMoved: number;
}

const STATIC_FALLBACK: StatsData = {
  customers: 2955,
  servicesPerformed: 578424,
  cashMoved: 2652053680,
};

export async function readFallbackStats(): Promise<StatsData> {
  try {
    const fileContent = await fs.readFile(FALLBACK_PATH, "utf8");
    const data = JSON.parse(fileContent);
    return data.stats;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[Fallback] Read failed:", err.message);
    return STATIC_FALLBACK;
  }
}

export async function writeFallbackStats(stats: StatsData): Promise<void> {
  if (process.env.VERCEL === "1") return;

  try {
    const data = {
      version: "v1",
      lastUpdated: Date.now(),
      stats: {
        customers: stats.customers,
        servicesPerformed: stats.servicesPerformed,
        cashMoved: stats.cashMoved,
      },
      source: "api",
    };

    const tempPath = FALLBACK_PATH + ".tmp";
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
    await fs.rename(tempPath, FALLBACK_PATH);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[Fallback] Write failed:", err.message);
  }
}
