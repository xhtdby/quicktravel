# Wiring the New Engine into app.js

## Current State

Your `app.js` currently calls Google Maps Directions API directly and processes the results.

## New Architecture

Instead of calling Google directly, call `generateCandidates()` from `src/engine.js`.

## Step-by-Step Integration

### 1. Add Imports at Top of app.js

```javascript
import { MockLondonProvider } from './src/providers.js';
import { londonFixtures } from './src/fixtures.london.js';
import { generateCandidates } from './src/engine.js';
```

### 2. Create Provider Instance

Add this near the top of your file (global scope):

```javascript
// Use mock provider for now (fast, deterministic)
const provider = new MockLondonProvider(londonFixtures);
```

### 3. Replace Route Finding Logic

Find your current route finding code (probably something like):

```javascript
// OLD CODE:
const directionsService = new google.maps.DirectionsService();
directionsService.route({
  origin: from,
  destination: to,
  travelMode: google.maps.TravelMode.TRANSIT,
  // ...
}, (response, status) => {
  // process results...
});
```

Replace with:

```javascript
// NEW CODE:
const routes = await generateCandidates(
  provider, 
  { from: fromText, to: toText }, 
  londonFixtures
);

// routes is an array of route objects:
// [
//   {
//     kind: 'transit_bus',
//     minutes: 43,
//     transfers: 1,
//     cost: 1.75,
//     co2: 120,
//     score: 78,
//     steps: [
//       { mode: 'walk', what: 'to bus', minutes: 5 },
//       { mode: 'bus', what: 'bus-biased', minutes: 38, cost: 1.75, co2: 120 }
//     ]
//   },
//   // ... more routes
// ]

displayRoutes(routes);
```

### 4. Update Display Function

Your existing `displayRoutes()` function needs to handle the new route format:

```javascript
function displayRoutes(routes) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  
  routes.forEach((route, index) => {
    const card = document.createElement('div');
    card.className = 'route-card';
    
    // Header with route type and time
    const header = document.createElement('div');
    header.className = 'route-header';
    header.innerHTML = `
      <h3>${formatRouteKind(route.kind)}</h3>
      <span class="route-time">${route.minutes} mins</span>
      <span class="route-score">Score: ${route.score}/100</span>
    `;
    
    // Steps breakdown
    const steps = document.createElement('div');
    steps.className = 'route-steps';
    route.steps.forEach(step => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'route-step';
      stepDiv.innerHTML = `
        <span class="step-icon">${getModeIcon(step.mode)}</span>
        <span class="step-what">${step.what}</span>
        <span class="step-time">${step.minutes} mins</span>
      `;
      steps.appendChild(stepDiv);
    });
    
    // Footer with cost and CO2
    const footer = document.createElement('div');
    footer.className = 'route-footer';
    footer.innerHTML = `
      <span>💷 £${route.cost.toFixed(2)}</span>
      <span>🌱 ${Math.round(route.co2)}g CO₂</span>
      <span>🔄 ${route.transfers} transfer${route.transfers !== 1 ? 's' : ''}</span>
    `;
    
    card.appendChild(header);
    card.appendChild(steps);
    card.appendChild(footer);
    resultsDiv.appendChild(card);
  });
}

function formatRouteKind(kind) {
  const map = {
    'transit_bus': 'Bus Route',
    'transit_rail': 'Rail Route',
    'walk': 'Walking',
    'bike_direct_santander': 'Santander Bike',
    'bike_direct_forest': 'Forest Bike',
    'bike_direct_lime': 'Lime Bike',
    'hybrid_bike_rail_santander': 'Bike + Rail (Santander)',
    'hybrid_bike_rail_lime': 'Bike + Rail (Lime)',
    'rail_plus_bike_lastmile_santander': 'Rail + Bike Finish',
  };
  return map[kind] || kind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getModeIcon(mode) {
  const icons = {
    'walk': '🚶',
    'bike': '🚴',
    'bus': '🚌',
    'rail': '🚇',
    'ridehail': '🚗'
  };
  return icons[mode] || '•';
}
```

### 5. Add CSS for New Route Cards

Add to `styles.css`:

```css
.route-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 15px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.route-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.route-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.route-time {
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
}

.route-score {
  font-size: 14px;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  color: #6b7280;
}

.route-steps {
  margin: 15px 0;
}

.route-step {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
}

.step-icon {
  font-size: 20px;
  width: 30px;
  text-align: center;
}

.step-what {
  flex: 1;
  color: #4b5563;
}

.step-time {
  font-size: 14px;
  color: #9ca3af;
}

.route-footer {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #6b7280;
}
```

## Testing the Integration

1. Open browser console
2. Enter a route (e.g., "Whitechapel" → "Paddington")
3. You should see 3-4 routes displayed
4. Check that:
   - Each route shows time, cost, CO₂
   - Steps are listed with icons
   - At least one hybrid route appears

## Fallback to Google (Later)

When ready to use real Google data, create `src/providers.google.js`:

```javascript
import { DataProvider } from './providers.js';

export class GoogleProvider extends DataProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.geocoder = new google.maps.Geocoder();
    this.directionsService = new google.maps.DirectionsService();
  }
  
  async geocode(place) {
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address: place }, (results, status) => {
        if (status === 'OK') {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          reject(new Error('Geocode failed: ' + status));
        }
      });
    });
  }
  
  async transitRoutes({from, to, bias}) {
    // Call Directions API with transit_mode bias
    return new Promise((resolve, reject) => {
      this.directionsService.route({
        origin: from,
        destination: to,
        travelMode: 'TRANSIT',
        transitOptions: {
          modes: [bias === 'bus' ? 'BUS' : 'RAIL']
        }
      }, (response, status) => {
        if (status === 'OK') {
          const leg = response.routes[0].legs[0];
          resolve([{
            mode: bias,
            minutes: Math.round(leg.duration.value / 60),
            transfers: leg.steps.filter(s => s.travel_mode === 'TRANSIT').length - 1
          }]);
        } else {
          reject(new Error('Directions failed: ' + status));
        }
      });
    });
  }
  
  // Implement other methods...
}
```

Then in `app.js`:

```javascript
// Switch from mock to real:
// const provider = new MockLondonProvider(londonFixtures);
const provider = new GoogleProvider('AIzaSyCf9okaNlSNpA2vdNKOVPHUqEUBcZyWTL0');
```

## Benefits of This Approach

✅ **Testable** - Mock provider = fast, deterministic tests  
✅ **Flexible** - Easy to switch between mock and real data  
✅ **Controlled** - We decide route logic, not Google  
✅ **Extensible** - Easy to add new route types  
✅ **Debuggable** - Clear separation of concerns

## Next Steps

1. Wire in the engine (this guide)
2. Test with mock provider
3. Implement GoogleProvider
4. Add real-time bike APIs
5. Deploy! 🚀
