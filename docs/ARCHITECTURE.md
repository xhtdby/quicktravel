# QuickTravel Architecture

## Overview

QuickTravel is a Progressive Web App (PWA) that provides intelligent multi-modal route planning by combining bike-sharing with public transit, optimizing for journeys that Google Maps doesn't consider.

## Core Components

### Frontend (`index.html`, `styles.css`)
- Responsive PWA interface
- Origin/destination input
- Route display with detailed breakdown
- Offline-capable UI

### Application Logic (`app.js`)
- Manages user interactions
- Coordinates between routing engine and Maps API
- Displays results to user
- Handles geolocation and autocomplete

### Routing Engine (`route-engine.js`)
- **Current Status**: 78/100 quality score
- **Purpose**: Generate diverse multi-modal routes
- **Algorithm**: Custom route generation combining:
  - Pure transit routes (bus, rail)
  - Pure cycling routes
  - Hybrid bike+transit routes
- **Issues to Fix**:
  - Only generates 2 routes (need 3-5)
  - Routes too similar (9 min difference, need 10+ min)
  - No hybrid routes generated (need 1+)

### Route Validator (`route-validator.js`)
- Quality assurance for generated routes
- Validates route diversity
- Checks for hybrid routes
- Ensures bike routes actually include biking
- Scores routes on multiple criteria

### Service Worker (`sw.js`)
- Enables offline functionality
- Caches static assets
- Provides PWA installability

### Manifest (`manifest.json`)
- PWA configuration
- App icons and metadata
- Install behavior

## Data Flow

```
User Input
    ↓
app.js (Geocoding)
    ↓
route-engine.js (Generate Routes)
    ↓
route-validator.js (Validate Quality)
    ↓
Google Maps API (Get Directions)
    ↓
app.js (Display Results)
    ↓
User Output
```

## Google Maps Integration

- **API Key**: Configured in `index.html`
- **Services Used**:
  - Directions API: Route calculation
  - Geocoding API: Address to coordinates
  - Distance Matrix API: Travel time estimates
  - Places API: Autocomplete suggestions

## Testing Architecture

### Automated Tests (`tests/`)
- **validate-routes.js**: Fast Node.js validation (2 seconds)
- **test-runner.js**: Full browser automation (Puppeteer)
- **run-tests.py**: Alternative browser testing (Selenium)

### Test Execution
- `npm test`: Quick validation
- `test.bat` / `test.sh`: Convenient wrappers
- GitHub Actions: CI/CD pipeline

### Validation Criteria
1. **Time Diversity**: ≥10 min spread between fastest/slowest
2. **Bike Usage**: Bike routes must have `mode: 'bike'`
3. **Hybrid Routes**: ≥1 route combining bike+transit
4. **Route Count**: ≥3 diverse options

## Directory Structure

```
quicktravel/
├── app.js                 # Main application logic
├── index.html            # PWA interface
├── styles.css            # Styling
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
├── route-engine.js       # Custom routing algorithm
├── route-validator.js    # Quality validation
├── test.bat / test.sh    # Test runners
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md   # This file
│   ├── GOOGLE_MAPS.md    # API setup guide
│   └── TESTING.md        # Testing guide
├── tests/                # Automated tests
│   ├── validate-routes.js
│   ├── test-runner.js
│   ├── run-tests.py
│   ├── run-tests.bat
│   └── run-tests.sh
└── icons/               # PWA icons
```

## Development Workflow

1. **Make Code Changes**: Edit `route-engine.js` or other files
2. **Run Tests**: `npm test` to validate changes
3. **Check Score**: Must reach 100/100 for production
4. **Manual Testing**: Open in browser for visual verification
5. **Commit**: Push changes once tests pass

## Next Steps

### Immediate Fixes Needed
1. Increase route count from 2 to 3-5 routes
2. Add hybrid bike+transit routes
3. Increase time diversity to 10+ minutes
4. Verify all changes with `npm test`

### Future Enhancements
- Real-time bike-share availability
- Custom bike speed preferences
- Weather-aware routing
- Multi-city support
- Route favoriting/history
