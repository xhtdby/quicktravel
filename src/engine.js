// src/engine.js
import { Modes, haversineKm, minutes } from './providers.js';
import { paretoFront, score } from './scoring.js';

const DEFAULT_SPREAD = 8;
const BIKE_KIND = /bike/;

export async function generateCandidates(provider, places, fixtures) {
  if (!places?.from || !places?.to) {
    throw new Error('Both from and to must be provided');
  }

  const [origin, destination] = await Promise.all([
    provider.geocode(places.from),
    provider.geocode(places.to)
  ]);

  const context = {
    origin,
    destination,
    fixtures,
    provider,
    now: new Date(),
  };

  const candidates = [
    await buildBikeDirect(context),
    await buildHybridBikeRail(context),
    await buildRailPlusBikeLastmile(context),
    await buildTransitRoute(context, 'bus'),
    await buildTransitRoute(context, 'rail'),
    buildWalkOnly(context),
  ].filter(Boolean);

  if (!candidates.length) {
    throw new Error('No viable routes generated');
  }

  candidates.forEach((route) => {
    route.score = score(route);
  });

  const diversity = fixtures?.diversitySpreadMinutes ?? DEFAULT_SPREAD;
  const front = paretoFront(candidates);
  const pool = Array.from(new Set([...front, ...candidates]));
  const picked = enforceDiversity(pool, diversity, fixtures);
  assertBikeIntegrity(picked);
  return picked.sort((a, b) => b.score - a.score);
}

async function buildTransitRoute(context, bias) {
  const { provider, origin, destination, fixtures, now } = context;
  const baselineList = await provider.transitRoutes({ from: origin, to: destination, bias, earliest: now });
  if (!baselineList?.length) return null;
  const baseline = baselineList[0];

  const distanceKm = haversineKm(origin, destination);
  const walkIn = minutes(Math.max(3, Math.min(12, distanceKm * 6)));
  const walkOut = minutes(Math.max(2, Math.min(10, distanceKm * 5)));
  const wait = minutes(baseline.waitMinutes ?? fixtures.penalties.wait ?? 3);
  const ride = minutes(baseline.rideMinutes ?? 0);
  if (!ride) return null;

  const costKey = bias === 'bus' ? 'bus' : 'rail';
  const co2Key = costKey;
  const mode = baseline.mode ?? (bias === 'bus' ? Modes.BUS : Modes.RAIL);
  const lineLabel = baseline.line ?? `${bias} service`;

  const steps = [
    makeStep(Modes.WALK, 'walk to stop', walkIn),
    makeStep(Modes.WAIT, 'wait for service', wait),
    makeStep(mode, lineLabel, ride, {
      cost: fixtures.costs[costKey] ?? 0,
      co2: distanceKm * (fixtures.co2[co2Key] ?? 0),
    }),
    makeStep(Modes.WALK, 'walk to destination', walkOut),
  ];

  return finaliseRoute(bias === 'bus' ? 'transit_bus' : 'transit_rail', steps, {
    transfers: baseline.transfers ?? 0,
  });
}

async function buildBikeDirect(context) {
  const { provider, origin, destination, fixtures } = context;
  const startStations = await provider.bikeStationsNear({ point: origin, radiusM: 700 });
  const endStations = await provider.bikeStationsNear({ point: destination, radiusM: 700 });

  const startOptions = startStations.filter((station) => station.type === 'dockless' || station.bikes > 0);
  if (!startOptions.length) return null;

  const dropOption = {
    id: 'dest-drop',
    provider: 'dockless',
    type: 'drop',
    lat: destination.lat,
    lng: destination.lng,
    docks: 0,
  };

  const endOptions = [
    ...endStations.filter((station) => station.type === 'dock' && station.docks > 0),
    dropOption,
  ];
  if (!endOptions.length) return null;

  let best = null;
  for (const start of startOptions) {
    for (const end of endOptions) {
      if (!isDirectCompatible(start, end)) continue;
      const endPoint = end.id === 'dest-drop' ? destination : end;
      const walkStart = estimateWalkMinutes(haversineKm(origin, start));
      const ride = await provider.cycleTimeMins(start, endPoint);
      const walkEnd = end.id === 'dest-drop' ? minutes(1) : estimateWalkMinutes(haversineKm(endPoint, destination));

      const unlock = start.type === 'dockless' ? fixtures.penalties.unlockDockless : fixtures.penalties.unlockBike;
      const dockPenalty = end.type === 'dock' ? fixtures.penalties.dockBike : 0;
      const providerKey = normaliseProvider(start.provider);
      const bikeCost = fixtures.costs[`bike_${providerKey}`] ?? fixtures.costs.bike ?? 0;

      const steps = [
        makeStep(Modes.WALK, `walk to ${providerKey} bike`, walkStart),
        makeStep(Modes.BIKE, `ride ${providerKey} bike`, ride + unlock + dockPenalty, {
          cost: bikeCost,
          co2: 0,
        }),
        makeStep(Modes.WALK, 'finish on foot', walkEnd),
      ];

      const route = finaliseRoute('bike_direct', steps, { provider: providerKey });
      if (!best || route.minutes < best.minutes) {
        best = route;
      }
    }
  }
  return best;
}

async function buildHybridBikeRail(context) {
  const { provider, origin, destination, fixtures, now } = context;
  const fromHub = await provider.nearestHub(origin);
  const toHub = await provider.nearestHub(destination);
  if (!fromHub || !toHub || fromHub.id === toHub.id) return null;

  const express = await provider.expressRailHop(fromHub.id, toHub.id, now);
  if (!express) return null;

  const startStations = await provider.bikeStationsNear({ point: origin, radiusM: 700 });
  const hubStartStations = await provider.bikeStationsNear({ point: fromHub, radiusM: 350 });
  const hubEndStations = await provider.bikeStationsNear({ point: toHub, radiusM: 350 });
  const endStations = await provider.bikeStationsNear({ point: destination, radiusM: 700 });

  const providers = intersectProviders(startStations, hubStartStations, hubEndStations, endStations);
  if (!providers.length) return null;

  let best = null;
  for (const providerName of providers) {
    const start = pickStation(startStations, providerName, true);
    const hubIn = pickStation(hubStartStations, providerName, false, true);
    const hubOut = pickStation(hubEndStations, providerName, true);
    const end = pickStation(endStations, providerName, false, true) ?? {
      lat: destination.lat,
      lng: destination.lng,
      type: 'drop',
      provider: providerName,
    };

    if (!start || !hubIn || !hubOut) continue;

    const walkStart = estimateWalkMinutes(haversineKm(origin, start));
    const firstRide = await provider.cycleTimeMins(start, hubIn);
    const secondRide = await provider.cycleTimeMins(hubOut, end.type === 'drop' ? destination : end);
    const walkEnd = end.type === 'drop' ? minutes(1) : estimateWalkMinutes(haversineKm(end, destination));

    const firstUnlock = start.type === 'dockless' ? fixtures.penalties.unlockDockless : fixtures.penalties.unlockBike;
    const firstDock = hubIn.type === 'dock' ? fixtures.penalties.dockBike : 0;
    const secondUnlock = hubOut.type === 'dockless' ? fixtures.penalties.unlockDockless : fixtures.penalties.unlockBike;
    const secondDock = end.type === 'drop' ? 0 : fixtures.penalties.dockBike;
    const bikeCost = fixtures.costs[`bike_${providerName}`] ?? fixtures.costs.bike ?? 0;

    const steps = [
      makeStep(Modes.WALK, `walk to ${providerName} bike`, walkStart),
      makeStep(Modes.BIKE, `ride to ${fromHub.name}`, firstRide + firstUnlock + firstDock, {
        cost: bikeCost,
        co2: 0,
      }),
      makeStep(Modes.WAIT, 'await express', express.wait),
      makeStep(Modes.RAIL, express.line, express.minutes + fixtures.penalties.transfer, {
        cost: fixtures.costs.rail ?? 0,
        co2: haversineKm(fromHub, toHub) * (fixtures.co2.rail ?? 0),
      }),
      makeStep(Modes.BIKE, `last-mile ${providerName} bike`, secondRide + secondUnlock + secondDock, {
        cost: bikeCost,
        co2: 0,
      }),
      makeStep(Modes.WALK, 'final walk', walkEnd),
    ];

    const route = finaliseRoute('hybrid_bike_rail', steps, {
      transfers: 1,
      meta: { via: [fromHub.id, toHub.id], provider: providerName },
    });

    if (!best || route.minutes < best.minutes) {
      best = route;
    }
  }

  return best;
}

async function buildRailPlusBikeLastmile(context) {
  const { provider, origin, destination, fixtures, now } = context;
  const baselineList = await provider.transitRoutes({ from: origin, to: destination, bias: 'rail', earliest: now });
  if (!baselineList?.length) return null;
  const baseline = baselineList[0];

  const toHub = await provider.nearestHub(destination);
  if (!toHub) return null;

  const hubStations = await provider.bikeStationsNear({ point: toHub, radiusM: 350 });
  const endStations = await provider.bikeStationsNear({ point: destination, radiusM: 700 });
  const providers = intersectProviders(hubStations, endStations);
  if (!providers.length) return null;

  let best = null;
  for (const providerName of providers) {
    const hubBike = pickStation(hubStations, providerName, true);
    const endDock = pickStation(endStations, providerName, false, true) ?? {
      lat: destination.lat,
      lng: destination.lng,
      type: 'drop',
      provider: providerName,
    };

    if (!hubBike) continue;

    const walkToRail = minutes(Math.max(3, Math.min(10, haversineKm(origin, destination) * 5)));
    const wait = minutes(baseline.waitMinutes ?? fixtures.penalties.wait ?? 3);
    const railRide = minutes(baseline.rideMinutes ?? 0);
    const bikeLast = await provider.cycleTimeMins(hubBike, endDock.type === 'drop' ? destination : endDock);
    const walkEnd = endDock.type === 'drop' ? minutes(1) : estimateWalkMinutes(haversineKm(endDock, destination));

    const unlock = hubBike.type === 'dockless' ? fixtures.penalties.unlockDockless : fixtures.penalties.unlockBike;
    const dock = endDock.type === 'drop' ? 0 : fixtures.penalties.dockBike;
    const bikeCost = fixtures.costs[`bike_${providerName}`] ?? fixtures.costs.bike ?? 0;

    const steps = [
      makeStep(Modes.WALK, 'walk to rail', walkToRail),
      makeStep(Modes.WAIT, 'await rail', wait),
      makeStep(Modes.RAIL, baseline.line ?? 'rail service', railRide, {
        cost: fixtures.costs.rail ?? 0,
        co2: haversineKm(origin, toHub) * (fixtures.co2.rail ?? 0),
      }),
      makeStep(Modes.BIKE, `last-mile ${providerName} bike`, bikeLast + unlock + dock, {
        cost: bikeCost,
        co2: 0,
      }),
      makeStep(Modes.WALK, 'final walk', walkEnd),
    ];

    const route = finaliseRoute('rail_plus_bike_lastmile', steps, {
      transfers: baseline.transfers ?? 0,
    });

    if (!best || route.minutes < best.minutes) {
      best = route;
    }
  }

  return best;
}

function buildWalkOnly(context) {
  const { origin, destination, fixtures } = context;
  const distanceKm = haversineKm(origin, destination);
  const walk = estimateWalkMinutes(distanceKm);
  const steps = [makeStep(Modes.WALK, 'walk entire journey', walk, {
    cost: fixtures.costs.walk ?? 0,
    co2: 0,
  })];
  return finaliseRoute('walk_only', steps, { transfers: 0 });
}

function makeStep(mode, description, value, extra = {}) {
  return {
    mode,
    description,
    minutes: minutes(Math.max(0, value || 0)),
    ...extra,
  };
}

function finaliseRoute(kind, steps, extras = {}) {
  const totalMinutes = steps.reduce((acc, step) => acc + (step.minutes ?? 0), 0);
  const totalCost = steps.reduce((acc, step) => acc + (step.cost ?? 0), 0);
  const totalCo2 = steps.reduce((acc, step) => acc + (step.co2 ?? 0), 0);
  return {
    kind,
    steps,
    minutes: totalMinutes,
    cost: Number(totalCost.toFixed(2)),
    co2: Math.round(totalCo2),
    transfers: extras.transfers ?? 0,
    meta: extras.meta,
  };
}

function estimateWalkMinutes(distanceKm) {
  return minutes(distanceKm * 12);
}

function normaliseProvider(value) {
  return (value || 'bike').toLowerCase();
}

function isDirectCompatible(start, end) {
  if (start.type === 'dockless') {
    return true;
  }
  if (end.id === 'dest-drop') {
    return false;
  }
  return end.provider === start.provider && end.docks > 0;
}

function pickStation(list, provider, requireBikes, requireDocks = false) {
  return list.find((station) => {
    if (station.provider !== provider) return false;
    if (station.type === 'dockless') {
      return !requireDocks;
    }
    if (requireBikes && station.bikes <= 0) return false;
    if (requireDocks && station.docks <= 0) return false;
    return true;
  }) ?? null;
}

function intersectProviders(...lists) {
  if (!lists.length) return [];
  const sets = lists.map((items) => new Set(items.map((item) => item.provider).filter(Boolean)));
  const [first, ...rest] = sets;
  return Array.from(first).filter((provider) => rest.every((set) => set.has(provider)));
}

function enforceDiversity(routes, spread, fixtures) {
  if (!routes.length) return [];

  const uniqueByKind = new Map();
  routes.forEach((route) => {
    if (!uniqueByKind.has(route.kind) || route.minutes < uniqueByKind.get(route.kind).minutes) {
      uniqueByKind.set(route.kind, route);
    }
  });

  let pool = Array.from(uniqueByKind.values());
  if (pool.length < 3) {
    pool = [...routes].sort((a, b) => a.minutes - b.minutes);
  }

  const candidateCombos = [
    ...combinations(pool, Math.min(4, pool.length)),
    ...combinations(pool, Math.min(3, pool.length)),
  ].filter((combo) => combo.length);

  let best = null;
  for (const combo of candidateCombos) {
    const spreadValue = computeSpread(combo);
    if (spreadValue < spread) continue;
    if (!hasDistinctKinds(combo, 3)) continue;
    if (!best || comboScore(combo) > comboScore(best)) {
      best = combo;
    }
  }

  if (!best) {
    best = pool.slice(0, Math.min(4, pool.length));
  }

  if (!best.some((route) => route.kind === 'hybrid_bike_rail')) {
    const hybrid = routes.find((route) => route.kind === 'hybrid_bike_rail');
    if (hybrid) {
      best = [hybrid, ...best].slice(0, 4);
    }
  }

  if (best.length < 3) {
    const extra = routes.filter((route) => !best.includes(route));
    for (const route of extra) {
      best.push(route);
      if (best.length >= 3) break;
    }
  }

  const sorted = [...new Set(best)].sort((a, b) => b.score - a.score);
  return sorted.slice(0, 4);
}

function combinations(list, size) {
  if (size <= 0 || size > list.length) return [];
  const result = [];
  const combo = [];
  function backtrack(start) {
    if (combo.length === size) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < list.length; i++) {
      combo.push(list[i]);
      backtrack(i + 1);
      combo.pop();
    }
  }
  backtrack(0);
  return result;
}

function computeSpread(routes) {
  if (!routes.length) return 0;
  const values = routes.map((route) => route.minutes);
  return Math.max(...values) - Math.min(...values);
}

function hasDistinctKinds(routes, minKinds) {
  return new Set(routes.map((route) => route.kind)).size >= minKinds;
}

function comboScore(routes) {
  return routes.reduce((sum, route) => sum + (route.score ?? 0), 0);
}

function assertBikeIntegrity(routes) {
  routes.forEach((route) => {
    if (BIKE_KIND.test(route.kind)) {
      const hasBike = route.steps.some((step) => step.mode === Modes.BIKE);
      if (!hasBike) {
        throw new Error(`Route ${route.kind} missing bike segment`);
      }
    }
  });
}
