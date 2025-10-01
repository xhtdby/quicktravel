# QuickTravel 🚴

A Progressive Web App (PWA) that helps you find faster bike-sharing routes for your daily travel. QuickTravel compares traditional transit routes with bike-sharing options to help you save time and get to your destination faster.

## Features

✨ **Smart Route Comparison** - Compare transit routes with bike-sharing alternatives
🗺️ **Google Maps Integration** - Real-time routing with Google Maps API
📱 **Progressive Web App** - Install on your iPhone home screen like a native app
🚴 **Bike-Sharing Optimized** - Find the fastest bike-sharing routes
⚡ **Offline Support** - Works even without internet connection (via service worker)
📍 **Location-Based** - Uses your current location for easy route planning
🎨 **Mobile-First Design** - Optimized for iPhone and mobile devices

## iPhone Installation Instructions

### How to Add QuickTravel to Your iPhone Home Screen

1. **Open in Safari**
   - Open Safari browser on your iPhone
   - Navigate to the QuickTravel web app URL

2. **Open Share Menu**
   - Tap the Share button (square with arrow pointing up) at the bottom of Safari
   
3. **Add to Home Screen**
   - Scroll down and tap "Add to Home Screen"
   - You'll see the QuickTravel icon and name
   
4. **Confirm Installation**
   - Tap "Add" in the top right corner
   - QuickTravel will now appear on your home screen!

5. **Launch the App**
   - Tap the QuickTravel icon on your home screen
   - The app will open in full-screen mode like a native app
   - No browser UI will be visible!

### iPhone PWA Features

When installed on iPhone, QuickTravel provides:
- ✅ Full-screen experience (no Safari UI)
- ✅ App icon on home screen
- ✅ Splash screen on launch
- ✅ Offline functionality
- ✅ Fast loading times
- ✅ Push notifications (if enabled)

## Quick Start

### Using the App

1. **Enter Locations**
   - Enter your starting point in the "Starting Point" field
   - Enter your destination in the "Destination" field

2. **Find Routes**
   - Tap "Find Best Route" button
   - The app will search for both transit and bike-sharing routes

3. **Compare Options**
   - View multiple route options
   - See duration, distance, and step-by-step directions
   - Routes marked with ⚡ FASTEST badge are the quickest options

4. **Select a Route**
   - Tap on any route card to see it highlighted on the map
   - Follow the step-by-step directions

### Demo Mode

The app includes a demo mode that works without a Google Maps API key:
- Shows sample routes for any location
- Demonstrates the UI and functionality
- Perfect for testing the PWA features

## Development

### Prerequisites

- A modern web browser (Chrome, Safari, Edge)
- A web server (for local testing)
- Google Maps API key (optional, for real routing)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/xhtdby/quicktravel.git
   cd quicktravel
   ```

2. **Serve the app locally**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # OR using Node.js http-server
   npx http-server -p 8000
   
   # OR using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   - Navigate to `http://localhost:8000`
   - The app should load and work in demo mode

### Adding Google Maps API Key

To use real routing instead of demo data:

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
   - Geocoding API

3. Open `app.js` and replace the API key:
   ```javascript
   const apiKey = 'YOUR_ACTUAL_API_KEY_HERE';
   ```

### Project Structure

```
quicktravel/
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── app.js             # Application logic and Google Maps integration
├── sw.js              # Service worker for offline support
├── manifest.json      # PWA manifest for installation
├── icons/             # App icons for various sizes
│   ├── icon-*.svg     # Generated SVG icons
│   └── generate-icons.py  # Icon generator script
└── README.md          # This file
```

## Technology Stack

- **HTML5** - Semantic markup and PWA meta tags
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No framework dependencies
- **Service Workers** - Offline functionality and caching
- **Google Maps API** - Route calculation and mapping
- **Web App Manifest** - PWA installation support

## Browser Compatibility

- ✅ Safari (iOS 11.3+) - Full PWA support
- ✅ Chrome (Desktop & Mobile) - Full PWA support
- ✅ Edge (Desktop & Mobile) - Full PWA support
- ✅ Firefox (Desktop & Mobile) - Partial PWA support
- ✅ Opera (Desktop & Mobile) - Full PWA support

## Features Explained

### Bike-Sharing Route Logic

The app implements smart routing logic that:
1. Calculates traditional transit routes (bus, subway, train)
2. Finds bike-sharing routes with walking segments
3. Compares travel times between options
4. Highlights the fastest route
5. Shows time savings when bike-sharing is faster

### Offline Capability

The service worker (`sw.js`) provides:
- Caching of app shell (HTML, CSS, JS)
- Offline fallback for basic functionality
- Background sync for queued actions
- Automatic updates when new versions are available

### Progressive Enhancement

The app works in multiple modes:
- **Full Mode** - With Google Maps API key (real routing)
- **Demo Mode** - Without API key (sample data)
- **Offline Mode** - Cached content when no internet

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.

## Future Enhancements

Planned features for future versions:
- [ ] Real-time bike availability at stations
- [ ] Weather-aware routing
- [ ] Saved favorite routes
- [ ] Multi-city support
- [ ] Electric scooter integration
- [ ] Carbon footprint tracking
- [ ] Social features (share routes)

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the documentation above
- Review the code comments for implementation details

---

Made with ❤️ for smarter urban mobility