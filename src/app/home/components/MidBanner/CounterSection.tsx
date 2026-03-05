import { readFallbackStats } from "@/utils/statsFallback";
import CounterSectionClient from "./CounterSectionClient";

export default async function CounterSection() {
  const initialStats = await readFallbackStats();

  return <CounterSectionClient initialStats={initialStats} />;
}
