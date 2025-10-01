# Google Maps API Setup Guide

This guide explains how to add Google Maps integration to QuickTravel for real routing functionality.

## Why Google Maps?

By default, QuickTravel runs in **demo mode** with mock data. To get real routing, you need to integrate the Google Maps API.

**Demo Mode (Default):**
- ✅ Works immediately, no setup needed
- ✅ Shows example routes with sample data
- ❌ Routes are not based on real locations
- ❌ No interactive map

**With Google Maps API:**
- ✅ Real-time routing based on actual locations
- ✅ Interactive map showing routes
- ✅ Accurate travel times and distances
- ✅ Turn-by-turn directions
- ❌ Requires API key and billing account

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a Project" → "New Project"
4. Enter project name: "QuickTravel"
5. Click "Create"

### 2. Enable Required APIs

Enable these four APIs for your project:

**Maps JavaScript API** (for interactive map)
1. Go to "APIs & Services" → "Library"
2. Search for "Maps JavaScript API"
3. Click on it and press "Enable"

**Directions API** (for route calculation)
1. Search for "Directions API"
2. Click on it and press "Enable"

**Places API** (for location autocomplete)
1. Search for "Places API"
2. Click on it and press "Enable"

**Geocoding API** (for address lookup)
1. Search for "Geocoding API"
2. Click on it and press "Enable"

### 3. Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. Your API key will be displayed (looks like: `AIzaSyD...`)
4. **Important:** Copy this key immediately

### 4. Secure Your API Key (Recommended)

**Restrict by Application:**
1. Click on your API key in the credentials list
2. Under "Application restrictions":
   - Select "HTTP referrers (websites)"
   - Add your domain: `https://yourdomain.com/*`
   - Add localhost for testing: `http://localhost:*`

**Restrict by API:**
1. Under "API restrictions":
   - Select "Restrict key"
   - Check only the 4 APIs listed above
2. Click "Save"

### 5. Set Up Billing (Required)

Google Maps requires a billing account:
1. Go to "Billing" in Cloud Console
2. Link a billing account
3. Add payment method

**Cost Information:**
- Google provides $200 free credit per month
- Most small apps stay within free tier
- QuickTravel typically uses < $50/month for moderate usage
- See [pricing calculator](https://mapsplatform.google.com/pricing/)

### 6. Add API Key to QuickTravel

Open `app.js` and find this line (around line 104):
```javascript
const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
```

Replace it with your actual API key:
```javascript
const apiKey = 'AIzaSyD...your-actual-key-here';
```

**Security Note:** 
- For production, use environment variables or a backend proxy
- Never commit API keys to public repositories
- Use domain restrictions as shown above

### 7. Test the Integration

1. Start local server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open http://localhost:8000 in browser

3. You should see in console:
   ```
   Google Maps API loaded
   Maps ready! Enter locations to find routes.
   ```

4. Test with real locations:
   - Start: "1600 Amphitheatre Parkway, Mountain View, CA"
   - Destination: "1 Infinite Loop, Cupertino, CA"
   - Click "Find Best Route"

5. You should see:
   - ✅ Interactive map with route displayed
   - ✅ Real travel times and distances
   - ✅ Actual turn-by-turn directions

## Configuration Options

### Change Default Map Center

In `app.js`, find the `initGoogleMaps` function:
```javascript
const mapOptions = {
    center: { lat: 40.7128, lng: -74.0060 }, // NYC
    zoom: 13,
    // ...
};
```

Change to your preferred location:
```javascript
center: { lat: 51.5074, lng: -0.1278 }, // London
center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
center: { lat: 35.6762, lng: 139.6503 }, // Tokyo
```

### Customize Route Options

Modify travel modes in the `findRoutesWithGoogleMaps` function:

**Current Options:**
```javascript
transitOptions: {
    modes: ['BUS', 'SUBWAY', 'TRAIN']
}
```

**Add Ferry:**
```javascript
transitOptions: {
    modes: ['BUS', 'SUBWAY', 'TRAIN', 'FERRY']
}
```

**Add Walking Route:**
```javascript
const walkRequest = {
    origin: start,
    destination: destination,
    travelMode: google.maps.TravelMode.WALKING
};
```

## Troubleshooting

### "This page can't load Google Maps correctly"

**Cause:** Invalid API key or billing not enabled

**Solution:**
1. Verify API key is correct
2. Check that billing is enabled
3. Verify required APIs are enabled
4. Check browser console for specific error

### Map Shows but Routes Don't Work

**Cause:** Directions API not enabled

**Solution:**
1. Go to Cloud Console
2. Enable "Directions API"
3. Wait a few minutes for activation
4. Refresh the page

### "RefererNotAllowedMapError"

**Cause:** Your domain is not allowed by API key restrictions

**Solution:**
1. Go to API key settings
2. Add your domain to "HTTP referrers"
3. Or temporarily remove restrictions for testing

### Routes are Inaccurate

**Cause:** Wrong travel mode or region

**Solution:**
1. Verify correct travel mode (BICYCLING vs DRIVING)
2. Check that bike routes exist in your area
3. Some regions don't have bike-sharing data

## API Usage Limits

### Free Tier (with $200 credit)
- **Maps JavaScript API:** 28,000 loads/month
- **Directions API:** 40,000 requests/month
- **Geocoding API:** 40,000 requests/month
- **Places API:** 17,000 requests/month

### Optimize Usage

**Cache Results:**
```javascript
// Cache frequently used routes
const routeCache = {};
const cacheKey = `${start}-${destination}`;
if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
}
```

**Reduce API Calls:**
- Only fetch routes when button is clicked
- Don't auto-refresh routes
- Cache geocoding results

**Monitor Usage:**
1. Go to Cloud Console → "APIs & Services" → "Dashboard"
2. View usage graphs
3. Set up quota alerts

## Advanced Features

### Autocomplete for Location Input

Add Places Autocomplete:
```javascript
const autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('start')
);
```

### Real-Time Traffic

Enable traffic layer:
```javascript
const trafficLayer = new google.maps.TrafficLayer();
trafficLayer.setMap(map);
```

### Alternative Routes

Get multiple route options:
```javascript
const request = {
    origin: start,
    destination: destination,
    travelMode: google.maps.TravelMode.BICYCLING,
    provideRouteAlternatives: true
};
```

### Bike-Sharing Stations

While Google Maps doesn't provide bike-sharing station locations directly, you can integrate third-party APIs:

**Example APIs:**
- CityBikes API (free)
- GBFS (General Bikeshare Feed Specification)
- Transit API

```javascript
// Example: Fetch bike stations
async function fetchBikeStations(lat, lng) {
    const response = await fetch(
        `https://api.citybik.es/v2/networks?lat=${lat}&lng=${lng}`
    );
    const data = await response.json();
    return data.networks;
}
```

## Production Deployment

### Security Best Practices

1. **Never commit API keys to Git:**
   ```bash
   # Add to .gitignore
   echo "config.js" >> .gitignore
   ```

2. **Use environment variables:**
   ```javascript
   const apiKey = process.env.GOOGLE_MAPS_API_KEY;
   ```

3. **Implement backend proxy:**
   - API key stays on server
   - Client makes requests to your server
   - Server proxies to Google Maps

4. **Monitor for abuse:**
   - Set up billing alerts
   - Monitor API dashboard regularly
   - Implement rate limiting

### Example Backend Proxy (Node.js)

```javascript
// server.js
app.get('/api/directions', async (req, res) => {
    const { origin, destination } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
    );
    
    const data = await response.json();
    res.json(data);
});
```

## Support Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [Stack Overflow - google-maps](https://stackoverflow.com/questions/tagged/google-maps)

## Need Help?

If you encounter issues:
1. Check the [Google Maps Platform Status](https://status.cloud.google.com/)
2. Review browser console for error messages
3. Test with Google's [API Key Checker](https://developers.google.com/maps/documentation/javascript/error-messages)
4. Contact Google Maps Platform Support (premium support available)

---

**Note:** QuickTravel works perfectly in demo mode without Google Maps. Only add the API key if you need real routing for production use.
