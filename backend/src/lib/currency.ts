const RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.09,
  GBP: 1.27,
  INR: 0.012,
  CAD: 0.74,
  AUD: 0.65,
  JPY: 0.0067,
  BRL: 0.20,
};

export function convertCents(amountCents: number, from: string, to: string): number {
  if (!(from in RATES)) throw new Error(`Unknown currency: ${from}`);
  if (!(to in RATES)) throw new Error(`Unknown currency: ${to}`);
  return Math.round(amountCents * RATES[from] / RATES[to]);
}
