// src/adapters/tflBikePoint.js
import { haversineKm } from '../providers.js';

const TFL_BASE = 'https://api.tfl.gov.uk';
const CACHE_TTL_MS = 60_000;

export class TflBikePointAdapter {
  constructor({ appId, appKey, fetchImpl } = {}) {
    this.appId = appId;
    this.appKey = appKey;
    this.fetch = fetchImpl || globalThis.fetch;
    if (!this.fetch) {
      throw new Error('fetch implementation required for TflBikePointAdapter');
    }
    this.cache = null;
    this.cacheStamp = 0;
  }

  async nearbyDocks(point, radiusM = 800) {
    const stations = await this.loadBikePoints();
    const maxKm = radiusM / 1000;
    return stations
      .filter((station) => station.bikes > 0 && haversineKm(point, station) <= maxKm)
      .map((station) => ({ ...station, provider: 'santander' }));
  }

  async loadBikePoints() {
    const now = Date.now();
    if (this.cache && (now - this.cacheStamp) < CACHE_TTL_MS) {
      return this.cache;
    }

    const url = new URL(${TFL_BASE}/BikePoint);
    if (this.appId && this.appKey) {
      url.searchParams.set('app_id', this.appId);
      url.searchParams.set('app_key', this.appKey);
    }

    const response = await this.fetch(url.toString());
    if (!response.ok) {
      throw new Error(TfL BikePoint request failed: );
    }
    const payload = await response.json();
    const mapped = payload.map(normalisePoint).filter(Boolean);
    this.cache = mapped;
    this.cacheStamp = now;
    return mapped;
  }
}

function normalisePoint(raw) {
  if (!raw || !raw.lat || !raw.lon) return null;
  const props = Object.fromEntries((raw.additionalProperties || []).map((prop) => [prop.key, prop.value]));
  const bikes = Number.parseInt(props.NbBikes ?? props.NbBicycles ?? '0', 10);
  const docks = Number.parseInt(props.NbDocks ?? props.NbSpaces ?? '0', 10);
  return {
    id: raw.id,
    name: raw.commonName,
    lat: Number(raw.lat),
    lng: Number(raw.lon),
    bikes: Number.isFinite(bikes) ? bikes : 0,
    docks: Number.isFinite(docks) ? docks : 0,
    provider: 'santander',
  };
}
