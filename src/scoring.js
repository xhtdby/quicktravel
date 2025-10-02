// src/scoring.js
export function paretoFront(routes) {
  return routes.filter((candidate) => {
    return !routes.some((other) => dominates(other, candidate));
  });
}

function dominates(a, b) {
  if (a === b) return false;
  const noWorse = (a.minutes <= b.minutes) && (a.transfers <= b.transfers) && (a.cost <= b.cost) && ((a.co2 ?? 0) <= (b.co2 ?? 0));
  const strictlyBetter = (a.minutes < b.minutes) || (a.transfers < b.transfers) || (a.cost < b.cost) || ((a.co2 ?? 0) < (b.co2 ?? 0));
  return noWorse && strictlyBetter;
}

export function score(route, weights = { time: 0.6, cost: 0.25, transfers: 0.1, co2: 0.05 }) {
  const metrics = {
    time: clamp01(1 - route.minutes / 120),
    cost: clamp01(1 - route.cost / 20),
    transfers: clamp01(1 - route.transfers / 6),
    co2: clamp01(1 - (route.co2 ?? 0) / 500)
  };
  const raw = (metrics.time * weights.time) + (metrics.cost * weights.cost) + (metrics.transfers * weights.transfers) + (metrics.co2 * weights.co2);
  return clamp100(raw * 100);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function clamp100(value) {
  return Math.max(0, Math.min(100, value));
}
