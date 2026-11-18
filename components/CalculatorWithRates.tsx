import CostCalculator from "./CostCalculator";
import { getRates } from "@/lib/rates";

/** Server wrapper: injects daily-cached exchange rates into the calculator. */
export default async function CalculatorWithRates() {
  const rates = await getRates();
  return <CostCalculator rates={rates} />;
}
