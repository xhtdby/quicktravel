// src/adapters/tflArrivals.js
const TFL_BASE = 'https://api.tfl.gov.uk';

export class TflArrivalsAdapter {
  constructor({ appId, appKey, fetchImpl, hubStopLookup = {}, defaultDurations = {} } = {}) {
    this.appId = appId;
    this.appKey = appKey;
    this.fetch = fetchImpl || globalThis.fetch;
    if (!this.fetch) {
      throw new Error('fetch implementation required for TflArrivalsAdapter');
    }
    this.hubStopLookup = hubStopLookup;
    this.defaultDurations = defaultDurations;
  }

  async arrivals(stopId) {
    if (!stopId) return [];
    const url = new URL(${TFL_BASE}/StopPoint//Arrivals);
    if (this.appId && this.appKey) {
      url.searchParams.set('app_id', this.appId);
      url.searchParams.set('app_key', this.appKey);
    }

    const response = await this.fetch(url.toString());
    if (!response.ok) {
      throw new Error(TfL arrivals request failed: );
    }
    const payload = await response.json();
    return payload.map((item) => ({
      line: item.lineName,
      destination: item.destinationName,
      etaMin: Math.max(0, Math.round((item.timeToStation ?? 0) / 60)),
      mode: item.modeName,
    })).sort((a, b) => a.etaMin - b.etaMin);
  }

  async trips(fromHubId, toHubId, earliest) {
    const fromStopId = this.hubStopLookup[fromHubId];
    const toStopId = this.hubStopLookup[toHubId];
    if (!fromStopId || !toStopId) return [];

    const arrivals = await this.arrivals(fromStopId);
    if (!arrivals.length) return [];

    const best = arrivals[0];
    const waitMinutes = best.etaMin;
    const durationMatrix = this.defaultDurations[fromHubId] || {};
    const rideMinutes = durationMatrix[toHubId] ?? 15;

    const depart = new Date(earliest.getTime() + waitMinutes * 60 * 1000);
    const arrive = new Date(depart.getTime() + rideMinutes * 60 * 1000);

    return [{
      depart,
      arrive,
      line: best.line,
      transfers: 0,
      waitMinutes,
    }];
  }
}
