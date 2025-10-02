# Google Maps API Configuration

## API Key Setup ✅

Your Google Maps API key has been securely configured in `index.html`.

### API Key Details

- **API Key**: `AIzaSyCf9okaNlSNpA2vdNKOVPHUqEUBcZyWTL0`
- **Location**: `index.html` (line with Google Maps script tag)
- **Libraries**: Places API (for location autocomplete)
- **Callback**: `initMap` (defined in app.js)

### Security Notes

⚠️ **Important Security Considerations**:

1. **API Key Restrictions**: 
   - Consider adding HTTP referrer restrictions in Google Cloud Console
   - Recommended: Restrict to your domain (e.g., `*.yourdomain.com/*`)
   - For localhost testing: Add `http://localhost:*` and `http://127.0.0.1:*`

2. **API Restrictions**:
   - Enable only required APIs: Maps JavaScript API, Places API, Directions API
   - Disable unused APIs to prevent unauthorized usage

3. **Quota Monitoring**:
   - Monitor usage in Google Cloud Console
   - Set up billing alerts
   - Consider daily quota limits

### How to Restrict Your API Key (Recommended)

1. Go to: https://console.cloud.google.com/google/maps-apis/credentials
2. Click on your API key
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add: `http://localhost:*/*` (for testing)
   - Add: `https://yourdomain.com/*` (for production)
4. Under "API restrictions":
   - Select "Restrict key"
   - Enable only:
     - Maps JavaScript API
     - Places API
     - Directions API
     - Geocoding API
     - Distance Matrix API

### Current Setup

The API key is loaded in `index.html`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCf9okaNlSNpA2vdNKOVPHUqEUBcZyWTL0&libraries=places&callback=initMap" async defer></script>
```

### Testing

1. Start server: `python -m http.server 8000`
2. Open: http://localhost:8000
3. Try searching: "Don Gratton House" → "Paddington"
4. Check console for:
   - ✅ Google Maps initialized
   - ✅ Routes generated

### APIs Used

| API | Purpose | Usage |
|-----|---------|-------|
| **Maps JavaScript API** | Display map | Required |
| **Places API** | Location autocomplete | Optional (future) |
| **Directions API** | Route calculation | Future (GoogleProvider) |
| **Geocoding API** | Address to coordinates | Future (GoogleProvider) |

### Future: GoogleProvider Implementation

When ready to use real Google data (instead of MockLondonProvider):

1. Create `src/providers.google.js`
2. Implement `GoogleProvider` class
3. Use these APIs:
   - `geocoder.geocode()` for location lookup
   - `directionsService.route()` for transit/bike routes
   - Places Autocomplete for input suggestions

### Current Provider

Currently using **MockLondonProvider** with fixtures:
- ✅ Fast (no API calls)
- ✅ Deterministic (tests pass)
- ✅ No quota usage
- ✅ Works offline

The map will display once you search for routes!

---

**Status**: ✅ API Key Configured  
**Map**: Will load on page  
**Provider**: MockLondonProvider (no API calls yet)  
**Next Step**: Test in browser at http://localhost:8000
