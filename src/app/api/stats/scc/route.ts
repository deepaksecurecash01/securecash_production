import { connectMongo } from "@/utils/connectMongo";
import { NextResponse } from "next/server";
import mongoose, { Model } from "mongoose";
import { writeFallbackStats } from "@/utils/statsFallback";

// ─── MONGOOSE DOCUMENT SHAPES ─────────────────────────────────────────────────
// strict: false schemas accept arbitrary fields from MongoDB — index signatures
// are required to satisfy Mongoose's Document type alongside the known fields.

interface ILocation {
  Status?: string;
  Zone?: string;
  [key: string]: unknown;
}

interface ITransactionItem {
  Type?: string;
  Cash?: string | number;
  [key: string]: unknown;
}

interface ITransaction {
  Organisation?: string;
  Items?: ITransactionItem[];
  [key: string]: unknown;
}

// ─── STATS SHAPE ──────────────────────────────────────────────────────────────

interface StatsData {
  customers: number;
  servicesPerformed: number;
  cashMoved: number;
  asOf: number;
  queryTime: string;
  source: string;
}

interface CacheState {
  data: StatsData | null;
  timestamp: number | null;
  isRefreshing: boolean;
}

interface AggregationResult {
  _id: null;
  totalCash: number;
}

// ─── MODELS ───────────────────────────────────────────────────────────────────

const locationSchema = new mongoose.Schema<ILocation>(
  {},
  { collection: "locations", strict: false },
);
const transactionSchema = new mongoose.Schema<ITransaction>(
  {},
  { collection: "transactions", strict: false },
);

const Location: Model<ILocation> =
  mongoose.models.Location ||
  mongoose.model<ILocation>("Location", locationSchema);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);

// ─── CACHE ────────────────────────────────────────────────────────────────────
// Module-level cache survives across requests within the same Node.js process.
// TTL: 6 hours fresh, 24 hours stale-while-revalidate.

const CACHE_TTL = 6 * 60 * 60 * 1000;
const STALE_WINDOW = 24 * 60 * 60 * 1000;

let cache: CacheState = {
  data: null,
  timestamp: null,
  isRefreshing: false,
};

const isCacheFresh = (): boolean =>
  !!(cache.data && cache.timestamp && Date.now() - cache.timestamp < CACHE_TTL);

const isCacheStale = (): boolean =>
  !!(
    cache.data &&
    cache.timestamp &&
    Date.now() - cache.timestamp < STALE_WINDOW
  );

// ─── DATA FETCHING ────────────────────────────────────────────────────────────

const fetchFreshStats = async (): Promise<StatsData> => {
  const startTime = Date.now();

  await connectMongo();

  const [customers, servicesPerformed, cashMovedResult] = await Promise.all([
    Location.countDocuments({ Status: "ACTIVE", Zone: "SCC" }),
    Transaction.countDocuments({ Organisation: "SCC" }),
    Transaction.aggregate<AggregationResult>([
      {
        $match: {
          Organisation: "SCC",
          "Items.Type": { $in: ["Bank Service", "Change Order"] },
        },
      },
      {
        $unwind: {
          path: "$Items",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "Items.Type": { $in: ["Bank Service", "Change Order"] },
          "Items.Cash": {
            $exists: true,
            $nin: [null, "", "0", "0.00", 0],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCash: {
            $sum: {
              $toDouble: {
                $replaceAll: {
                  input: { $trim: { input: { $toString: "$Items.Cash" } } },
                  find: ",",
                  replacement: "",
                },
              },
            },
          },
        },
      },
    ]).allowDiskUse(true),
  ]);

  const cashMoved =
    cashMovedResult.length > 0 ? Math.round(cashMovedResult[0].totalCash) : 0;

  const stats: StatsData = {
    customers,
    servicesPerformed,
    cashMoved,
    asOf: Date.now(),
    queryTime: `${Date.now() - startTime}ms`,
    source: "database",
  };

  cache = { data: stats, timestamp: Date.now(), isRefreshing: false };

  // Fire-and-forget — failure is logged but must not reject the main response.
  writeFallbackStats(stats).catch((err: unknown) =>
    console.error("[API] Fallback write failed:", err),
  );

  return stats;
};

const backgroundRefresh = async (): Promise<void> => {
  if (cache.isRefreshing) return;
  cache.isRefreshing = true;

  try {
    await fetchFreshStats();
  } catch (error) {
    console.error("[API] Background refresh failed:", error);
    cache.isRefreshing = false;
  }
};

// ─── ROUTE HANDLERS ───────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    if (isCacheFresh()) {
      return NextResponse.json(
        { ...cache.data, source: "cache-fresh" },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
            "X-Cache-Status": "HIT",
          },
        },
      );
    }

    if (isCacheStale()) {
      // Serve stale data immediately, refresh in the background.
      backgroundRefresh().catch(console.error);

      return NextResponse.json(
        { ...cache.data, source: "cache-stale" },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "public, max-age=0, s-maxage=300, stale-while-revalidate=1800",
            "X-Cache-Status": "STALE",
          },
        },
      );
    }

    const freshStats = await fetchFreshStats();

    return NextResponse.json(freshStats, {
      status: 200,
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}

// POST busts the cache and returns freshly-fetched stats.
export async function POST(): Promise<NextResponse> {
  try {
    cache = { data: null, timestamp: null, isRefreshing: false };
    const freshStats = await fetchFreshStats();

    return NextResponse.json({
      success: true,
      message: "Cache refreshed",
      data: freshStats,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { success: false, message: "Refresh failed", error: message },
      { status: 500 },
    );
  }
}
