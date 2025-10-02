// src/adapters/googleGeocoder.js
export class GoogleGeocoder {
  constructor(google) {
    if (!google?.maps?.Geocoder) {
      throw new Error('google maps geocoder unavailable');
    }
    this.geocoder = new google.maps.Geocoder();
  }

  async toLatLng(query) {
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address: query }, (results, status) => {
        if (status !== 'OK' || !Array.isArray(results) || !results.length) {
          reject(new Error(Google geocode failed: ));
          return;
        }
        const first = results[0];
        resolve({ lat: first.geometry.location.lat(), lng: first.geometry.location.lng() });
      });
    });
  }

  static fromWindow() {
    if (typeof window === 'undefined' || !window.google) return null;
    try {
      return new GoogleGeocoder(window.google);
    } catch (error) {
      console.warn('GoogleGeocoder initialisation failed', error);
      return null;
    }
  }
}
