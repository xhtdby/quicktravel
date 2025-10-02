// src/adapters/docklessGbfs.js
import { haversineKm } from '../providers.js';

const DEFAULT_TTL_MS = 30_000;

export class DocklessGbfsAdapter {
  constructor({ baseUrl, provider, fetchImpl } = {}) {
    if (!baseUrl) {
      throw new Error('DocklessGbfsAdapter requires a baseUrl');
    }
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.provider = provider || 'dockless';
    this.fetch = fetchImpl || globalThis.fetch;
    if (!this.fetch) {
      throw new Error('fetch implementation required for DocklessGbfsAdapter');
    }
    this.cache = null;
    this.cacheStamp = 0;
  }

  async nearbyBikes(point, radiusM = 600) {
    const bikes = await this.loadBikes();
    const maxKm = radiusM / 1000;
    return bikes
      .filter((bike) => haversineKm(point, bike) <= maxKm)
      .map((bike) => ({ ...bike, provider: this.provider }));
  }

  async loadBikes() {
    const now = Date.now();
    if (this.cache && (now - this.cacheStamp) < DEFAULT_TTL_MS) {
      return this.cache;
    }

    const url = ${this.baseUrl}/free_bike_status.json;
    const response = await this.fetch(url);
    if (!response.ok) {
      throw new Error(GBFS request failed: );
    }
    const payload = await response.json();
    const list = payload?.data?.bikes || payload?.data?.bikestrings || [];
    const bikes = list
      .map((bike) => ({
        id: bike.bike_id || bike.id,
        lat: Number(bike.lat),
        lng: Number(bike.lon ?? bike.lng),
      }))
      .filter((bike) => Number.isFinite(bike.lat) && Number.isFinite(bike.lng));

    this.cache = bikes;
    this.cacheStamp = now;
    return bikes;
  }
}
