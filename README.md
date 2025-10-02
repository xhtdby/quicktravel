# QuickTravel 🚴‍♂️

**Smart Multi-Modal Route Finder PWA**

QuickTravel generates intelligent hybrid routes by combining bike-sharing (Santander, Forest, Lime) with public transit. Unlike traditional route planners, we control the route generation logic to create truly optimal multi-modal combinations.

---

## ✨ Features

- 🎯 **Intelligent Route Generation** - Creates 3-4 diverse, optimized routes per search
- 🚴 **Multi-Provider Bikes** - Supports Santander, Forest, and Lime bike-sharing
- 🚇 **Hybrid Routes** - Bike→Rail→Bike combinations for faster cross-city travel
- ⚡ **Fast Testing** - Deterministic tests run in <10ms with no network calls
- 📱 **PWA** - Install on mobile home screen, works offline
- 🗺️ **London-Ready** - Pre-configured for London transit hubs and bike stations
- 🧪 **Test-Driven** - CI/CD pipeline ensures quality on every commit

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
npm test
```

Output:
```
🧪 Running QuickTravel Engine Tests

Test 1: Don Gratton House → Paddington (hybrid route test)
✅ Passed

Test 2: Liverpool Street → Bank (short distance test)
✅ Passed

Test 3: Whitechapel → Oxford Circus (cross-city test)
✅ Passed

Test 4: King's Cross → Victoria (hub-to-hub test)
✅ Passed

✅ All tests passed (4 suites) in 9ms
```

### 3. Start Development Server

```bash
python -m http.server 8000
```

Visit: http://localhost:8000

### 4. Try It Out

1. Enter origin (e.g., "Whitechapel")
2. Enter destination (e.g., "Paddington")
3. View 3-4 diverse routes:
   - Transit baselines (bus, rail)
   - Direct bike routes
   - Hybrid bike+rail routes
   - Last-mile bike options

---

## 🏗️ Architecture

### New Modular Design

```
quicktravel/
├── src/                          # Core routing engine
│   ├── engine.js                 # Route generation logic
│   ├── providers.js              # Abstract data provider + mock
│   ├── fixtures.london.js        # London test data
│   └── scoring.js                # Pareto optimization
├── tests/                        # Automated testing
│   ├── run.js                    # Test runner
│   └── engine.spec.js            # Test cases
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # (Old - needs update)
│   ├── ENGINE.md                 # New engine architecture
│   ├── GOOGLE_MAPS.md            # API setup
│   └── TESTING.md                # Testing guide
├── app.js                        # UI logic (to be updated)
├── index.html                    # PWA interface
└── .github/workflows/ci.yml      # CI/CD pipeline
```

### Key Principle

**We control route generation.** Google Maps provides data (geocoding, transit times, cycling times), but **we decide which hybrid combinations to create**.

See [docs/ENGINE.md](docs/ENGINE.md) for full architecture details.

---

## 🧪 Testing

### Run Tests

```bash
npm test              # Fast engine tests (<10ms)
npm run test:old      # Legacy route validation
npm run test:browser  # Puppeteer browser tests
```

### Test Philosophy

- ✅ **Deterministic** - Same input always produces same output
- ✅ **Fast** - No network calls, runs in milliseconds
- ✅ **Comprehensive** - Tests all route types and edge cases
- ✅ **Automated** - CI/CD fails if tests don't pass

### What Tests Validate

1. **Route Count** - Returns ≥3 routes
2. **Route Diversity** - ≥3 different types (bus, rail, bike, hybrid)
3. **Time Spread** - Routes vary by 4-10+ minutes
4. **Hybrid Routes** - At least one bike+transit combo for medium+ distances
5. **Bike Authenticity** - All "bike" routes actually include bike steps

---

## 🚴 Multi-Provider Bike Support

QuickTravel supports three bike-sharing providers:

| Provider | Type | Cost | Unlock Time | Dock Time |
|----------|------|------|-------------|-----------|
| **Santander** | Docked | £1.95 | 1 min | 1 min |
| **Forest** | Dockless | £1.50 | 0.5 min | 0 min |
| **Lime** | Dockless | £1.80 | 0.5 min | 0 min |

The engine automatically generates routes using all available providers in the area.

---

## 📊 Route Types Generated

### 1. Transit Baselines
- `transit_bus` - Bus-optimized route
- `transit_rail` - Rail-optimized route

### 2. Walk Baseline
- `walk` - Full walking route (always available)

### 3. Direct Bike Routes
- `bike_direct_santander` - Walk→Santander bike→walk
- `bike_direct_forest` - Walk→Forest bike→walk
- `bike_direct_lime` - Walk→Lime bike→walk

### 4. Hybrid Routes
- `hybrid_bike_rail_*` - Bike→Hub→Express Rail→Hub→Bike
- Can mix providers: `hybrid_bike_rail_santander_lime`

### 5. Last-Mile Bike
- `rail_plus_bike_lastmile_*` - Rail→Bike (final hop)

---

## 🎯 Current Status

### ✅ Completed
- [x] Modular routing engine with provider abstraction
- [x] Multi-provider bike support (Santander, Forest, Lime)
- [x] Pareto optimization (time, cost, transfers, CO₂)
- [x] Deterministic testing framework
- [x] CI/CD pipeline with GitHub Actions
- [x] London fixtures with 13 bike stations
- [x] Hybrid route generation (bike+rail)
- [x] All tests passing in <10ms

### 🔄 In Progress
- [ ] Wire new engine into app.js
- [ ] Update UI to display new route types
- [ ] Add provider badges to route cards

### 📋 Next Steps
1. Update `app.js` to use `generateCandidates()` from `src/engine.js`
2. Implement `GoogleProvider` for real API calls
3. Add real-time bike availability APIs
4. Expand to more cities (NYC, SF, Chicago)
5. Add user preference controls (fast/cheap/green)

---

## 🔧 Configuration

### Google Maps API Key

API key is configured in `index.html`:

```javascript
const API_KEY = 'AIzaSyCf9okaNlSNpA2vdNKOVPHUqEUBcZyWTL0';
```

See [docs/GOOGLE_MAPS.md](docs/GOOGLE_MAPS.md) for setup instructions.

### Adding Cities

Create a new fixtures file:

```javascript
// src/fixtures.nyc.js
export const nycFixtures = {
  geocodes: { /* locations */ },
  stations: [ /* Citi Bike stations */ ],
  hubs: [ /* transit hubs */ ],
  express: [ /* express routes */ ],
  costs: { bike_citibike: 3.50 },
  // ...
};
```

---

## 📱 PWA Installation

### iPhone
1. Open Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Android
1. Open Chrome
2. Tap menu (⋮)
3. Select "Add to Home Screen"
4. Tap "Add"

---

## 🤝 Contributing

### Running Tests Before Commit

```bash
npm test
```

Tests must pass before committing. CI will automatically run tests on push.

### Adding Test Cases

Edit `tests/engine.spec.js`:

```javascript
results.push(await test_case('Origin','Destination', { 
  minSpread: 8,        // min time difference
  requireHybrid: true  // must include hybrid route
}));
```

---

## 📚 Documentation

- [ENGINE.md](docs/ENGINE.md) - Routing engine architecture
- [GOOGLE_MAPS.md](docs/GOOGLE_MAPS.md) - API setup guide
- [TESTING.md](docs/TESTING.md) - Testing documentation
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System overview (legacy)

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Maps**: Google Maps JavaScript API
- **Testing**: Node.js (no external frameworks)
- **CI/CD**: GitHub Actions
- **PWA**: Service Worker, Web Manifest

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Credits

Built with ❤️ for smarter urban mobility.

**API Key**: AIzaSyCf9okaNlSNpA2vdNKOVPHUqEUBcZyWTL0  
**Repository**: xhtdby/quicktravel  
**Branch**: main
