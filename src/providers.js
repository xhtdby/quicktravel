// src/providers.js
/**
 * Provider utilities and fixture adapters used by the routing engine.
 * Interfaces are expressed as JSDoc typedefs so both fixtures and live data can plug in.
 */

/** @typedef {{ lat: number, lng: number }} LatLng */
/** @typedef {{ id: string, name?: string, provider: string, lat: number, lng: number, bikes: number, docks: number }} BikeDock */
/** @typedef {{ id: string, provider: string, lat: number, lng: number }} DocklessBike */
/** @typedef {{ line: string, destination: string, etaMin: number, mode: string }} Arrival */
/** @typedef {{ depart: Date, arrive: Date, line: string, transfers: number, waitMinutes: number }} Trip */

/**
 * @typedef {Object} BikeDockAdapter
 * @property {(point: LatLng, radiusM: number) => Promise<BikeDock[]>} nearbyDocks
 */

/**
 * @typedef {Object} DocklessAdapter
 * @property {(point: LatLng, radiusM: number) => Promise<DocklessBike[]>} nearbyBikes
 */

/**
 * @typedef {Object} TransitAdapter
 * @property {(stopId: string) => Promise<Arrival[]>} arrivals
 * @property {(fromHubId: string, toHubId: string, earliest: Date) => Promise<Trip[]>} trips
 */

/**
 * @typedef {Object} Geocode
 * @property {(query: string) => Promise<LatLng>} toLatLng
 */

export const Modes = {
  WALK: 'walk',
  BIKE: 'bike',
  BUS: 'bus',
  RAIL: 'rail',
  WAIT: 'wait',
};

export function minutes(value) {
  return Math.round(value);
}

export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const DEFAULT_RADIUS_M = 800;

export class FixtureBikeDockAdapter {
  constructor(fixtures) {
    this.fixtures = fixtures;
  }

  async nearbyDocks(point, radiusM = DEFAULT_RADIUS_M) {
    const maxKm = radiusM / 1000;
    return this.fixtures.bikeDocks
      .filter((dock) => dock.bikes > 0 && haversineKm(point, dock) <= maxKm)
      .map((dock) => ({ ...dock }));
  }
}

export class FixtureDocklessAdapter {
  constructor(fixtures) {
    this.fixtures = fixtures;
  }

  async nearbyBikes(point, radiusM = DEFAULT_RADIUS_M) {
    const maxKm = radiusM / 1000;
    return this.fixtures.docklessBikes
      .filter((bike) => haversineKm(point, bike) <= maxKm)
      .map((bike) => ({ ...bike }));
  }
}

export class FixtureTransitAdapter {
  constructor(fixtures) {
    this.fixtures = fixtures;
  }

  async arrivals(stopId) {
    const arrivals = this.fixtures.arrivals?.[stopId] || [];
    return arrivals.map((item) => ({ ...item }));
  }

  async trips(fromHubId, toHubId, earliest) {
    const hop = this.fixtures.express.find((entry) => entry.from === fromHubId && entry.to === toHubId);
    if (!hop) return [];
    const depart = new Date(earliest.getTime());
    const arrive = new Date(depart.getTime() + hop.minutes * 60 * 1000);
    return [{
      depart,
      arrive,
      line: hop.line,
      transfers: 0,
      waitMinutes: this.fixtures.penalties.wait ?? 3,
    }];
  }
}

export class FixtureGeocoder {
  constructor(fixtures) {
    this.fixtures = fixtures;
  }

  async toLatLng(query) {
    const key = query.trim().toLowerCase();
    const hit = this.fixtures.geocodes[key];
    if (!hit) {
      throw new Error(`unknown place: ${query}`);
    }
    return { lat: hit.lat, lng: hit.lng };
  }
}

export class CompositeProvider {
  constructor({ fixtures, geocoder, bikeDockAdapter, docklessAdapters = [], transitAdapter }) {
    this.fixtures = fixtures;
    this.geocoder = geocoder;
    this.bikeDockAdapter = bikeDockAdapter;
    this.docklessAdapters = docklessAdapters;
    this.transitAdapter = transitAdapter;
  }

  async geocode(query) {
    const key = query.trim().toLowerCase();
    const cached = this.fixtures.geocodes[key];
    if (cached) {
      return { lat: cached.lat, lng: cached.lng };
    }
    if (!this.geocoder) {
      throw new Error(`geocode fallback unavailable for ${query}`);
    }
    return this.geocoder.toLatLng(query);
  }

  async bikeDocksNear(point, radiusM = DEFAULT_RADIUS_M) {
    const results = [];
    if (this.bikeDockAdapter) {
      results.push(...await this.bikeDockAdapter.nearbyDocks(point, radiusM));
    }
    if (this.fixtures?.bikeDocks?.length) {
      results.push(...await new FixtureBikeDockAdapter(this.fixtures).nearbyDocks(point, radiusM));
    }
    const byId = new Map();
    results.forEach((dock) => {
      const existing = byId.get(dock.id);
      if (!existing || dock.bikes > existing.bikes) {
        byId.set(dock.id, dock);
      }
    });
    return Array.from(byId.values());
  }

  async docklessBikesNear(point, radiusM = DEFAULT_RADIUS_M) {
    const results = [];
    for (const adapter of this.docklessAdapters) {
      results.push(...await adapter.nearbyBikes(point, radiusM));
    }
    if (this.fixtures?.docklessBikes?.length) {
      results.push(...await new FixtureDocklessAdapter(this.fixtures).nearbyBikes(point, radiusM));
    }
    const seen = new Map();
    results.forEach((bike) => {
      if (!seen.has(bike.id)) {
        seen.set(bike.id, bike);
      }
    });
    return Array.from(seen.values());
  }

  async bikeStationsNear({ point, radiusM = DEFAULT_RADIUS_M }) {
    const docks = await this.bikeDocksNear(point, radiusM);
    const dockless = await this.docklessBikesNear(point, radiusM);
    return [
      ...docks.map((dock) => ({
        id: dock.id,
        name: dock.name,
        provider: dock.provider,
        lat: dock.lat,
        lng: dock.lng,
        bikes: dock.bikes,
        docks: dock.docks,
        type: 'dock',
      })),
      ...dockless.map((bike) => ({
        id: bike.id,
        provider: bike.provider,
        lat: bike.lat,
        lng: bike.lng,
        bikes: 1,
        docks: 0,
        type: 'dockless',
      })),
    ];
  }

  async cycleTimeMins(a, b) {
    const km = Math.max(0.1, haversineKm(a, b));
    const avgKmh = km < 2 ? 16 : 18;
    return minutes((km / avgKmh) * 60 + 2);
  }

  async transitBaseline({ from, to, bias, earliest = new Date() }) {
    if (this.transitAdapter) {
      const fromHub = this.nearestHubSync(from);
      const toHub = this.nearestHubSync(to);
      if (fromHub && toHub) {
        const trips = await this.transitAdapter.trips(fromHub.id, toHub.id, earliest);
        if (trips.length) {
          const best = trips[0];
          return {
            mode: bias === 'bus' ? Modes.BUS : Modes.RAIL,
            rideMinutes: Math.max(1, (best.arrive.getTime() - best.depart.getTime()) / 60000),
            waitMinutes: best.waitMinutes ?? 3,
            transfers: best.transfers ?? 0,
            line: best.line,
          };
        }
      }
    }
    return this.fixtureTransitBaseline({ from, to, bias });
  }

  fixtureTransitBaseline({ from, to, bias }) {
    const km = Math.max(0.25, haversineKm(from, to));
    if (bias === 'bus') {
      return {
        mode: Modes.BUS,
        rideMinutes: minutes(km * 3.8 + 10),
        waitMinutes: minutes(4 + km * 0.3),
        transfers: km > 7 ? 2 : 1,
        line: 'bus-baseline',
      };
    }
    return {
      mode: Modes.RAIL,
      rideMinutes: minutes(Math.max(8, km * 2.2 + 6)),
      waitMinutes: minutes(3 + km * 0.2),
      transfers: km > 10 ? 1 : 0,
      line: 'rail-baseline',
    };
  }

  async expressTrip(fromHubId, toHubId, earliest = new Date()) {
    if (this.transitAdapter) {
      const trips = await this.transitAdapter.trips(fromHubId, toHubId, earliest);
      if (trips.length) {
        const best = trips[0];
        return {
          minutes: Math.max(1, (best.arrive.getTime() - best.depart.getTime()) / 60000),
          wait: best.waitMinutes ?? 3,
          line: best.line,
          transfers: best.transfers ?? 0,
        };
      }
    }
    const hop = this.fixtures.express.find((entry) => entry.from === fromHubId && entry.to === toHubId);
    if (!hop) return null;
    return {
      minutes: hop.minutes,
      wait: this.fixtures.penalties.wait ?? 3,
      line: hop.line,
      transfers: 0,
    };
  }

  async expressRailHop(fromHubId, toHubId, earliest = new Date()) {
    return this.expressTrip(fromHubId, toHubId, earliest);
  }

  async transitRoutes({ from, to, bias, earliest = new Date() }) {
    const baseline = await this.transitBaseline({ from, to, bias, earliest });
    return [{
      mode: baseline.mode,
      rideMinutes: baseline.rideMinutes,
      waitMinutes: baseline.waitMinutes,
      transfers: baseline.transfers,
      line: baseline.line,
    }];
  }

  async nearestHub(point) {
    return this.nearestHubSync(point);
  }

  nearestHubSync(point) {
    let best = null;
    let bestKm = Infinity;
    for (const hub of this.fixtures.hubs) {
      const dist = haversineKm(point, hub);
      if (dist < bestKm) {
        best = hub;
        bestKm = dist;
      }
    }
    return best ? { ...best } : null;
  }
}

export function createFixtureProvider(fixtures, options = {}) {
  const geocoder = new FixtureGeocoder(fixtures);
  const bikeDockAdapter = new FixtureBikeDockAdapter(fixtures);
  const docklessAdapter = new FixtureDocklessAdapter(fixtures);
  const transitAdapter = new FixtureTransitAdapter(fixtures);
  return new CompositeProvider({
    fixtures,
    geocoder,
    bikeDockAdapter,
    docklessAdapters: [docklessAdapter],
    transitAdapter,
    ...options,
  });
}
