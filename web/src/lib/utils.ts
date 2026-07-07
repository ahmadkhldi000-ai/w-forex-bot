export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* Deterministic pseudo-random — keeps charts stable across renders */
export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* Random walk generator for sparklines & charts */
export function randomWalk(
  seed: number,
  points: number,
  start = 100,
  volatility = 0.02,
  drift = 0
): number[] {
  const rng = seededRandom(seed);
  const out: number[] = [start];
  for (let i = 1; i < points; i++) {
    const shock = (rng() - 0.5) * 2 * volatility;
    out.push(out[i - 1] * (1 + shock + drift));
  }
  return out;
}

export function formatMoney(n: number, dp = 2): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return (
    sign +
    "$" +
    abs.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })
  );
}

export function formatPct(n: number, dp = 2): string {
  const sign = n > 0 ? "+" : "";
  return sign + n.toFixed(dp) + "%";
}
