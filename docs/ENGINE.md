# QuickTravel Engine Architecture

## Overview

QuickTravel now uses a **deterministic, testable routing engine** that generates diverse multi-modal routes by combining bike-sharing (Santander, Forest, Lime) with public transit.

## Key Principle

**We control the route generation.** Google Maps provides data (geocoding, transit baselines, cycling times), but **we decide which hybrid combinations to create**.

## Architecture

### Core Components

```
src/
├── engine.js           # Main route generation logic
├── providers.js        # Abstract data provider interface
├── fixtures.london.js  # Test data for London
└── scoring.js          # Pareto optimization & scoring

tests/
├── run.js              # Test runner
└── engine.spec.js      # Deterministic test cases
```

### Data Flow

```
User Input (from/to)
    ↓
engine.generateCandidates()
    ├→ Provider: geocode locations
    ├→ Provider: get transit baselines (bus/rail)
    ├→ Provider: get bike stations (all providers)
    ├→ Provider: get cycling times
    ├→ Provider: get express rail hops
    └→ Generate candidates:
        ├─ transit_bus (baseline)
        ├─ transit_rail (baseline)
        ├─ walk (always available)
        ├─ bike_direct_santander
        ├─ bike_direct_forest
        ├─ bike_direct_lime
        ├─ hybrid_bike_rail_* (bike→hub→rail→hub→bike)
        └─ rail_plus_bike_lastmile_* (rail→bike)
    ↓
Pareto Front Optimization (time/cost/transfers/co2)
    ↓
Diversity Enforcement (≥3 routes, different kinds, time spread)
    ↓
Return 3-4 optimized, diverse routes
```

## Multi-Provider Bike Support

QuickTravel supports **three bike-sharing providers**:

1. **Santander Cycles** (docked)
   - Cost: £1.95
   - Stations: Fixed docks
   - Penalty: 1 min unlock + 1 min dock

2. **Forest** (dockless)
   - Cost: £1.50
   - Stations: GPS-based, flexible
   - Penalty: 0.5 min unlock

3. **Lime** (dockless)
   - Cost: £1.80
   - Stations: GPS-based, flexible
   - Penalty: 0.5 min unlock

The engine automatically generates routes using all available providers, creating variants like:
- `bike_direct_santander`
- `bike_direct_forest`
- `hybrid_bike_rail_santander_lime` (different providers for first/last mile)

## Route Types Generated

### 1. Transit Baselines
- **transit_bus**: Bus-optimized route
- **transit_rail**: Rail-optimized route

### 2. Walk Baseline
- **walk**: Full walking route (always available)

### 3. Direct Bike
- **bike_direct_{provider}**: Walk→bike→walk
- Generated for each available provider

### 4. Hybrid Routes
- **hybrid_bike_rail_{provider1}_{provider2}**: Walk→bike→hub→rail→hub→bike→walk
- Uses express rail between major hubs
- Can mix providers (e.g., Santander first mile, Lime last mile)

### 5. Last-Mile Bike
- **rail_plus_bike_lastmile_{provider}**: Walk→rail→bike→walk
- Replaces long final walk with quick bike hop

## Testing

### Run Tests

```bash
npm test
```

Tests run in **<10ms** with deterministic fixtures. No network calls, no browser needed.

### Test Cases

1. **Don Gratton House → Paddington**: Medium distance, hybrids viable
2. **Liverpool Street → Bank**: Short distance, bike dominance
3. **Whitechapel → Oxford Circus**: Cross-city, hybrid routes
4. **King's Cross → Victoria**: Hub-to-hub, express rail

### Test Validation

Each test verifies:
- ✅ **Route count**: ≥3 diverse routes
- ✅ **Kind diversity**: ≥3 different route types
- ✅ **Time spread**: Sufficient variation (4-10+ mins)
- ✅ **Hybrid routes**: At least one hybrid for medium+ distances
- ✅ **Bike authenticity**: All bike routes have actual bike steps

## Pareto Optimization

Routes are optimized across **4 dimensions**:
1. **Time** (60% weight)
2. **Cost** (25% weight)
3. **Transfers** (10% weight)
4. **CO₂** (5% weight)

The `paretoFront()` function eliminates dominated routes:
- Route A dominates B if A is ≤ on all dimensions AND < on at least one

## Diversity Enforcement

`ensureDiversity()` ensures:
1. At most one route per base kind
2. Minimum 3 routes returned
3. Fallback: Add routes with ≥8 min time difference

## Real vs Mock Providers

### Current: MockLondonProvider
- Uses `fixtures.london.js`
- Deterministic, fast tests
- Simple distance-based calculations

### Future: GoogleProvider
Implement these methods using Google Maps API:
- `geocode()` → Places Geocoding API
- `transitRoutes({bias})` → Directions API (separate calls for bus/rail)
- `cycleTimeMins()` → Directions API (BICYCLING mode)
- `bikeStationsNear()` → Santander API + Forest API + Lime API
- `expressRailHop()` → Curated hub data (cached)
- `nearestHub()` → Curated hub data (cached)

**Critical**: Even with Google, **we still control route generation**. Google only provides primitives.

## Extending to More Cities

1. Create `fixtures.{city}.js` with:
   - Geocodes for key locations
   - Bike stations (all local providers)
   - Transit hubs
   - Express routes between hubs
   - Local costs/penalties

2. Add provider-specific bike APIs:
   ```javascript
   costs: { 
     bike_citibike: 3.50,   // NYC
     bike_divvy: 3.00,      // Chicago
     bike_bayarea: 3.50,    // SF Bay Area
   }
   ```

3. Update `engine.js` if needed for city-specific logic

## CI/CD

GitHub Actions automatically runs tests on every push:

```yaml
# .github/workflows/ci.yml
- run: node tests/run.js
```

Tests must pass before merge.

## Next Steps

1. **Wire into UI**: Update `app.js` to call `generateCandidates()`
2. **Real API**: Implement `GoogleProvider` class
3. **Add Cities**: Create fixtures for NYC, SF, Chicago
4. **Live Data**: Integrate real-time bike availability APIs
5. **User Preferences**: Allow weight customization (fast vs cheap vs green)

## Files Changed

### New Files
- ✅ `src/engine.js` - Route generation
- ✅ `src/providers.js` - Abstract provider + mock
- ✅ `src/fixtures.london.js` - London test data
- ✅ `src/scoring.js` - Pareto optimization
- ✅ `tests/engine.spec.js` - Test cases
- ✅ `tests/run.js` - Test runner
- ✅ `.github/workflows/ci.yml` - CI pipeline

### Modified Files
- ⏳ `app.js` - Wire in new engine (next step)
- ⏳ `package.json` - Updated test script

### Unchanged Files
- ✅ `index.html` - UI stays the same
- ✅ `styles.css` - Styling unchanged
- ✅ `manifest.json` - PWA config unchanged
- ✅ `sw.js` - Service worker unchanged

## Philosophy

> "Don't ask Google for a journey plan. Ask Google for data, then build better plans yourself."

This architecture gives us:
- **Control**: We decide route logic
- **Testability**: Fast, deterministic tests
- **Transparency**: No black-box algorithms
- **Extensibility**: Easy to add providers/cities
- **Quality**: Guaranteed diversity and hybrid routes
