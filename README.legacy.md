# QuickTravel 🚴# QuickTravel 🚴



**Smart Multi-Modal Route Finder**A Progressive Web App (PWA) that helps you find faster bike-sharing routes for your daily travel. QuickTravel intelligently combines bike-sharing with public transit to create truly optimal multi-modal routes.



A Progressive Web App that creates intelligent bike + transit combinations to optimize your urban travel. QuickTravel doesn't just show Google's routes—it builds its own routing strategy using bike-sharing stations and transit hubs.## Features



---✨ **Intelligent Multi-Modal Routing** - Creates hybrid routes combining bike + transit

🗺️ **Google Maps Integration** - Real-time routing with Google Maps API  

## ✨ Key Features📱 **Progressive Web App** - Install on your home screen like a native app

🚴 **Smart Bike-Sharing** - Strategic bike usage to skip inefficient transit segments

- 🚴 **Intelligent Bike Integration** - Strategic bike-sharing to skip slow transit segments⚡ **Automated Testing** - Built-in quality validation for route generation

- 🚇 **Multi-Modal Routes** - Combines bike, bus, rail, and walking optimally📍 **Location-Based** - London-focused with 20 bike stations and 9 transit hubs

- ⚡ **Route Diversity** - Shows 4-5 genuinely different options per search🎨 **Mobile-First Design** - Optimized for mobile devices

- 📱 **Progressive Web App** - Install on mobile home screen

- 🧪 **Quality Validated** - Automated testing ensures routes make sense## iPhone Installation Instructions

- 🗺️ **London-Optimized** - 20 bike stations, 9 major transit hubs

### How to Add QuickTravel to Your iPhone Home Screen

---

1. **Open in Safari**

## 🚀 Quick Start   - Open Safari browser on your iPhone

   - Navigate to the QuickTravel web app URL

### 1. Install Dependencies

```bash2. **Open Share Menu**

npm install   - Tap the Share button (square with arrow pointing up) at the bottom of Safari

```   

3. **Add to Home Screen**

### 2. Start Local Server   - Scroll down and tap "Add to Home Screen"

```bash   - You'll see the QuickTravel icon and name

python -m http.server 8000   

```4. **Confirm Installation**

   - Tap "Add" in the top right corner

### 3. Open App   - QuickTravel will now appear on your home screen!

Navigate to `http://localhost:8000`

5. **Launch the App**

### 4. Search Routes   - Tap the QuickTravel icon on your home screen

- Enter start and destination   - The app will open in full-screen mode like a native app

- Click "Find Best Route"   - No browser UI will be visible!

- Compare multiple options

### iPhone PWA Features

---

When installed on iPhone, QuickTravel provides:

## 🧪 Testing- ✅ Full-screen experience (no Safari UI)

- ✅ App icon on home screen

### Run Automated Tests- ✅ Splash screen on launch

```bash- ✅ Offline functionality

# Validation tests (2 seconds)- ✅ Fast loading times

npm test- ✅ Push notifications (if enabled)



# Or use batch script## Quick Start

.\run-tests.bat

```### Using the App



### Test Output1. **Enter Locations**

```   - Enter your starting point in the "Starting Point" field

╔════════════════════════════════════════════════════╗   - Enter your destination in the "Destination" field

║  QuickTravel Route Validation Test                ║

╚════════════════════════════════════════════════════╝2. **Find Routes**

   - Tap "Find Best Route" button

📋 Current Implementation: 78/100 ❌   - The app will search for both transit and bike-sharing routes

📋 Target Implementation: 100/100 ✅

3. **Compare Options**

Issues:   - View multiple route options

  ❌ Time diversity: 9 min (need 10+)   - See duration, distance, and step-by-step directions

  ❌ Hybrid routes: 0 (need 1+)   - Routes marked with ⚡ FASTEST badge are the quickest options

  ❌ Route count: 2 (need 3+)

```4. **Select a Route**

   - Tap on any route card to see it highlighted on the map

See `docs/TESTING.md` for complete testing guide.   - Follow the step-by-step directions



---### Demo Mode



## 📁 Project StructureThe app includes a demo mode that works without a Google Maps API key:

- Shows sample routes for any location

```- Demonstrates the UI and functionality

quicktravel/- Perfect for testing the PWA features

├── index.html              # Main app UI

├── app.js                  # Application logic## Development

├── route-engine.js         # Custom routing algorithm

├── route-validator.js      # Quality validation### Prerequisites

├── styles.css              # Styling

├── manifest.json           # PWA manifest- A modern web browser (Chrome, Safari, Edge)

├── sw.js                   # Service worker- A web server (for local testing)

│- Google Maps API key (optional, for real routing)

├── tests/

│   ├── validate-routes.js  # Automated validation### Local Development

│   ├── test-runner.js      # Browser automation

│   └── run-tests.py        # Python test runner1. **Clone the repository**

│   ```bash

├── docs/   git clone https://github.com/xhtdby/quicktravel.git

│   ├── TESTING.md          # Testing guide   cd quicktravel

│   ├── GOOGLE_MAPS.md      # API setup   ```

│   └── ARCHITECTURE.md     # Technical design

│2. **Serve the app locally**

└── .github/workflows/   ```bash

    └── test.yml            # CI/CD automation   # Using Python 3

```   python3 -m http.server 8000

   

---   # OR using Node.js http-server

   npx http-server -p 8000

## 🔧 Configuration   

   # OR using PHP

### Google Maps API Key   php -S localhost:8000

   ```

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)

2. Enable: Maps JavaScript API, Directions API, Geocoding API3. **Open in browser**

3. Add to `app.js`:   - Navigate to `http://localhost:8000`

   ```javascript   - The app should load and work in demo mode

   const apiKey = 'AIzaSyCf9okaNlSNpA2vdNKOVPHUqEUBcZyWTL0';

   ```### Adding Google Maps API Key



See `docs/GOOGLE_MAPS.md` for detailed setup.To use real routing instead of demo data:



---1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)

2. Enable these APIs:

## 🎯 Route Types Generated   - Maps JavaScript API

   - Directions API

### 1. Express Rail   - Places API

- Fastest option for medium/long distances   - Geocoding API

- Example: Whitechapel → Paddington via Elizabeth Line (26 mins)

3. Open `app.js` and replace the API key:

### 2. Bike + Transit Hybrid   ```javascript

- Bike to major hub, then express transit   const apiKey = 'YOUR_ACTUAL_API_KEY_HERE';

- Example: Bike 3km to Liverpool Street, then train (28 mins)   ```



### 3. Direct Bike### Project Structure

- Eco-friendly option for short/medium distances

- Example: 10km bike ride via cycle paths (38 mins)```

quicktravel/

### 4. Bus Route├── index.html          # Main HTML structure

- Budget option, wider coverage├── styles.css          # Styling and responsive design

- Example: Bus 25 to destination (43 mins)├── app.js             # Application logic and Google Maps integration

├── sw.js              # Service worker for offline support

---├── manifest.json      # PWA manifest for installation

├── icons/             # App icons for various sizes

## 📊 Validation Criteria│   ├── icon-*.svg     # Generated SVG icons

│   └── generate-icons.py  # Icon generator script

Routes must meet these quality standards:└── README.md          # This file

```

| Criterion | Requirement | Score Weight |

|-----------|-------------|--------------|## Technology Stack

| **Time Diversity** | ≥10 min spread between routes | 25% |

| **Route Count** | 3-5 different options | 25% |- **HTML5** - Semantic markup and PWA meta tags

| **Hybrid Routes** | ≥1 bike+transit combination | 25% |- **CSS3** - Modern styling with CSS Grid and Flexbox

| **Bike Usage** | Bike routes have actual biking | 25% |- **Vanilla JavaScript** - No framework dependencies

- **Service Workers** - Offline functionality and caching

Routes scoring < 80/100 are blocked from display.- **Google Maps API** - Route calculation and mapping

- **Web App Manifest** - PWA installation support

---

## Browser Compatibility

## 🛠️ Development

- ✅ Safari (iOS 11.3+) - Full PWA support

### Run Tests During Development- ✅ Chrome (Desktop & Mobile) - Full PWA support

```bash- ✅ Edge (Desktop & Mobile) - Full PWA support

npm test- ✅ Firefox (Desktop & Mobile) - Partial PWA support

```- ✅ Opera (Desktop & Mobile) - Full PWA support



### Watch Mode (Re-runs on Changes)## Features Explained

```bash

npm run test:watch### Bike-Sharing Route Logic

```

The app implements smart routing logic that:

### Browser Tests1. Calculates traditional transit routes (bus, subway, train)

```bash2. Finds bike-sharing routes with walking segments

# Start server first3. Compares travel times between options

python -m http.server 8000 &4. Highlights the fastest route

5. Shows time savings when bike-sharing is faster

# Run Puppeteer tests

npm run test:browser### Offline Capability



# Or Python/Selenium testsThe service worker (`sw.js`) provides:

python tests/run-tests.py- Caching of app shell (HTML, CSS, JS)

```- Offline fallback for basic functionality

- Background sync for queued actions

---- Automatic updates when new versions are available



## 🤝 Contributing### Progressive Enhancement



1. Fork the repositoryThe app works in multiple modes:

2. Create a feature branch- **Full Mode** - With Google Maps API key (real routing)

3. Make changes- **Demo Mode** - Without API key (sample data)

4. Run tests: `npm test`- **Offline Mode** - Cached content when no internet

5. Ensure tests pass (90+ score)

6. Submit pull request## Contributing



All PRs must pass automated tests via GitHub Actions.Contributions are welcome! Please feel free to submit a Pull Request.



---## License



## 📖 DocumentationMIT License - feel free to use this project for learning and development.



- **Testing Guide**: `docs/TESTING.md`## Future Enhancements

- **Google Maps Setup**: `docs/GOOGLE_MAPS.md`

- **Architecture**: `docs/ARCHITECTURE.md`Planned features for future versions:

- [ ] Real-time bike availability at stations

---- [ ] Weather-aware routing

- [ ] Saved favorite routes

## 🏗️ Technical Stack- [ ] Multi-city support

- [ ] Electric scooter integration

- **Frontend**: Vanilla JavaScript (no frameworks)- [ ] Carbon footprint tracking

- **Maps**: Google Maps JavaScript API- [ ] Social features (share routes)

- **Testing**: Node.js, Puppeteer, Selenium

- **CI/CD**: GitHub Actions## Support

- **PWA**: Service Workers, Web App Manifest

For issues, questions, or suggestions:

---- Open an issue on GitHub

- Check the documentation above

## 📄 License- Review the code comments for implementation details



MIT License---



---Made with ❤️ for smarter urban mobility

## 🙏 Acknowledgments

- Google Maps API for routing data
- London bike-sharing stations data
- TfL transit information

---

**Made with ❤️ for smarter urban mobility**

*Current Status: Routes score 78/100 - improvements in progress to reach 100/100*
