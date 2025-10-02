// src/fixtures.london.js
export const londonFixtures = {
  geocodes: {
    'don gratton house': { lat: 51.51735, lng: -0.0663 },
    'don gratton': { lat: 51.51735, lng: -0.0663 },
    'don gratton house london': { lat: 51.51735, lng: -0.0663 },
    'paddington': { lat: 51.51699, lng: -0.1761 },
    'paddington station': { lat: 51.51539, lng: -0.17588 },
    'whitechapel': { lat: 51.51962, lng: -0.05998 },
    'whitechapel station': { lat: 51.51962, lng: -0.05998 },
    'oxford circus': { lat: 51.51542, lng: -0.14186 },
    '21 farm way': { lat: 51.3795, lng: -0.2589 },
    'worcester park kt4 8rx': { lat: 51.3815, lng: -0.2465 },
    'green park': { lat: 51.50667, lng: -0.1428 },
    'old kent road': { lat: 51.4863, lng: -0.0716 },
    'liverpool street': { lat: 51.51738, lng: -0.08233 },
    'bank': { lat: 51.51335, lng: -0.089 },
    "king's cross": { lat: 51.5308, lng: -0.1238 },
    'victoria': { lat: 51.49648, lng: -0.14467 },
    'victoria station': { lat: 51.49648, lng: -0.14467 },
    'waterloo': { lat: 51.5033, lng: -0.1147 },
    'greenwich': { lat: 51.478, lng: -0.01 }
  },
  bikeDocks: [
    { id: 'whitechapel-santander', name: 'Whitechapel High St', provider: 'santander', lat: 51.5197, lng: -0.0596, bikes: 10, docks: 24 },
    { id: 'aldgate-santander', name: 'Aldgate', provider: 'santander', lat: 51.5143, lng: -0.0756, bikes: 6, docks: 18 },
    { id: 'liverpool-st-santander', name: 'Liverpool Street', provider: 'santander', lat: 51.5177, lng: -0.0827, bikes: 12, docks: 30 },
    { id: 'bank-santander', name: 'Bank', provider: 'santander', lat: 51.5136, lng: -0.0883, bikes: 7, docks: 22 },
    { id: 'paddington-santander', name: 'Paddington Station', provider: 'santander', lat: 51.5152, lng: -0.1754, bikes: 14, docks: 28 },
    { id: 'hyde-park-north', name: 'Hyde Park North', provider: 'santander', lat: 51.5137, lng: -0.1703, bikes: 5, docks: 20 },
    { id: 'oxford-circus-santander', name: 'Oxford Circus', provider: 'santander', lat: 51.5155, lng: -0.142, bikes: 8, docks: 20 },
    { id: 'victoria-santander', name: 'Victoria', provider: 'santander', lat: 51.4966, lng: -0.1448, bikes: 9, docks: 22 },
    { id: 'kings-cross-santander', name: "King's Cross", provider: 'santander', lat: 51.531, lng: -0.124, bikes: 11, docks: 26 },
    { id: 'waterloo-santander', name: 'Waterloo', provider: 'santander', lat: 51.5034, lng: -0.1142, bikes: 13, docks: 24 }
  ],
  docklessBikes: [
    { id: 'whitechapel-forest-1', provider: 'forest', lat: 51.5199, lng: -0.0602 },
    { id: 'shoreditch-lime-1', provider: 'lime', lat: 51.5254, lng: -0.081 },
    { id: 'paddington-forest-1', provider: 'forest', lat: 51.5164, lng: -0.1782 },
    { id: 'oxford-circus-lime-1', provider: 'lime', lat: 51.5155, lng: -0.1415 },
    { id: 'victoria-lime-1', provider: 'lime', lat: 51.497, lng: -0.145 }
  ],
  hubs: [
    { id: 'liverpool-st', name: 'Liverpool Street', lat: 51.5177, lng: -0.0827, stopId: '940GZZLST', mode: 'rail' },
    { id: 'kings-cross', name: "King's Cross", lat: 51.5308, lng: -0.1238, stopId: '940GZZLKC', mode: 'rail' },
    { id: 'paddington', name: 'Paddington', lat: 51.51699, lng: -0.1761, stopId: '940GZZLPAD', mode: 'rail' },
    { id: 'victoria', name: 'Victoria', lat: 51.49648, lng: -0.14467, stopId: '940GZZLVI', mode: 'rail' },
    { id: 'waterloo', name: 'Waterloo', lat: 51.5033, lng: -0.1147, stopId: '940GZZLWA', mode: 'rail' },
    { id: 'oxford', name: 'Oxford Circus', lat: 51.51542, lng: -0.14186, stopId: '940GZZLOSQ', mode: 'rail' },
    { id: 'bank', name: 'Bank/Monument', lat: 51.51335, lng: -0.089, stopId: '940GZZLBNK', mode: 'rail' }
  ],
  express: [
    { from: 'liverpool-st', to: 'paddington', minutes: 11, line: 'EL + Circle' },
    { from: 'paddington', to: 'liverpool-st', minutes: 12, line: 'Circle + EL' },
    { from: 'kings-cross', to: 'paddington', minutes: 9, line: 'H&C Express' },
    { from: 'paddington', to: 'kings-cross', minutes: 10, line: 'H&C Express' },
    { from: 'kings-cross', to: 'victoria', minutes: 13, line: 'Victoria Express' },
    { from: 'victoria', to: 'kings-cross', minutes: 14, line: 'Victoria Express' },
    { from: 'liverpool-st', to: 'waterloo', minutes: 10, line: 'Waterloo Link' },
    { from: 'waterloo', to: 'liverpool-st', minutes: 10, line: 'Waterloo Link' }
  ],
  arrivals: {
    '940GZZLST': [ { line: 'Elizabeth', destination: 'Paddington', etaMin: 3, mode: 'rail' } ],
    '940GZZLPAD': [ { line: 'Circle', destination: 'Liverpool Street', etaMin: 4, mode: 'rail' } ],
    '940GZZLKC': [ { line: 'H&C', destination: 'Paddington', etaMin: 5, mode: 'rail' } ],
    '940GZZLVI': [ { line: 'Victoria', destination: "King's Cross", etaMin: 6, mode: 'rail' } ],
    '940GZZLBNK': [ { line: 'DLR', destination: 'Bank', etaMin: 2, mode: 'rail' } ],
    '940GZZLOSQ': [ { line: 'Bakerloo', destination: 'Oxford Circus', etaMin: 4, mode: 'rail' } ],
    '940GZZLWA': [ { line: 'Northern', destination: 'Waterloo', etaMin: 3, mode: 'rail' } ]
  },
  costs: {
    bike: 2.0,
    bike_forest: 1.6,
    bike_lime: 1.9,
    rail: 2.8,
    bus: 1.75,
    walk: 0
  },
  co2: {
    bike: 0,
    rail: 35,
    bus: 80,
    walk: 0
  },
  penalties: {
    transfer: 4,
    unlockBike: 1,
    dockBike: 1,
    unlockDockless: 0.5,
    wait: 3
  },
  diversitySpreadMinutes: 8
};
