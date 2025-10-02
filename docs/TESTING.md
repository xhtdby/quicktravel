# QuickTravel PWA - Testing Guide

## Quick Test

To test the QuickTravel PWA locally:

```bash
# Start a local web server
python3 -m http.server 8000

# Open in browser
# Navigate to http://localhost:8000
```

## Test Cases

### 1. Basic Functionality Test

**Test Route Finding:**
1. Enter "Central Park, New York" as starting point
2. Enter "Times Square, New York" as destination
3. Ensure "Include bike-sharing stations" is checked
4. Click "Find Best Route"
5. ✅ Should show 2 routes: Transit (25 mins) and Bike-Sharing (18 mins)
6. ✅ Bike route should have "⚡ FASTEST" badge
7. ✅ Should show "Save 7 mins with bike-sharing!" message

**Test Transit-Only Mode:**
1. Enter "Brooklyn Bridge" as starting point
2. Enter "Empire State Building" as destination
3. Uncheck "Include bike-sharing stations"
4. Click "Find Best Route"
5. ✅ Should show only 1 route: Transit Route (25 mins)

### 2. PWA Installation Test

**Desktop/Android:**
1. Open in Chrome/Edge
2. ✅ Should see install prompt in address bar
3. ✅ Should see "📱 Add to Home Screen" button in footer
4. Click install
5. ✅ App should install and open in standalone window

**iPhone/iPad (Safari):**
1. Open in Safari browser
2. Tap Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. ✅ Should see QuickTravel icon and name
5. Tap "Add"
6. ✅ Icon should appear on home screen
7. Tap icon to launch
8. ✅ Should open full-screen (no Safari UI)

### 3. Service Worker Test

**Offline Capability:**
1. Open app in browser
2. Open DevTools → Application → Service Workers
3. ✅ Service Worker should be registered and active
4. Load the app once (cache files)
5. Go offline (DevTools → Network → Offline)
6. Refresh the page
7. ✅ App should still load and display cached content

**Cache Verification:**
1. Open DevTools → Application → Cache Storage
2. ✅ Should see "quicktravel-v1.0.0" cache
3. ✅ Cache should contain: /, /index.html, /styles.css, /app.js, /manifest.json

### 4. Manifest Test

**Validation:**
```bash
# Check manifest is valid JSON
curl http://localhost:8000/manifest.json | python3 -m json.tool
```

**Expected Values:**
- ✅ name: "QuickTravel - Smart Bike Route Finder"
- ✅ short_name: "QuickTravel"
- ✅ display: "standalone"
- ✅ theme_color: "#2196F3"
- ✅ 9 icon sizes: 72, 96, 128, 144, 152, 180, 192, 384, 512

### 5. UI/UX Test

**Responsive Design:**
1. Test on different screen sizes:
   - ✅ Desktop (1920x1080)
   - ✅ Tablet (768x1024)
   - ✅ Mobile (375x667)
2. ✅ All elements should be readable and accessible
3. ✅ Touch targets should be large enough (min 44x44px)

**Loading States:**
1. Click "Find Best Route"
2. ✅ Button should change to "Finding Routes"
3. ✅ Button should be disabled during loading
4. ✅ Loading animation should appear
5. ✅ Status message should show "Finding the best routes for you..."

**Interactive Elements:**
1. Click on any route card
2. ✅ Card should highlight (light blue background)
3. ✅ Status message should update: "Selected [route type] route ([duration])"
4. ✅ Console should log route selection

### 6. Input Validation Test

**Empty Inputs:**
1. Leave both fields empty
2. Click "Find Best Route"
3. ✅ Should show warning: "Please enter both start and destination locations."

**Single Input:**
1. Enter only starting point
2. Click "Find Best Route"
3. ✅ Should show same warning

**Keyboard Navigation:**
1. Enter start location
2. Press Enter
3. ✅ Should trigger route search (if destination is filled)

### 7. Browser Compatibility

Test in multiple browsers:
- ✅ Chrome (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Edge (Desktop)
- ✅ Firefox (Desktop & Mobile)
- ✅ Opera (Desktop)

### 8. Console Messages

Expected console logs:
```
✅ QuickTravel PWA loaded successfully
✅ QuickTravel initializing...
✅ Using mock Google Maps implementation
✅ Using mock maps implementation
✅ Service Worker registered: http://localhost:8000/
```

### 9. Network Test

**API Simulation:**
1. With mock mode (default), routes load instantly after 1.5s delay
2. ✅ Network request should complete successfully
3. ✅ No errors in console

**With Google Maps API Key:**
1. Add valid API key to app.js
2. ✅ Should load Google Maps JavaScript API
3. ✅ Should make real routing requests
4. ✅ Should display interactive map

### 10. Status Messages Test

Test different status types:
- ✅ Info (blue): "Demo mode: Enter locations to see sample routes."
- ✅ Success (green): "Routes found! Click on a route to see details."
- ✅ Warning (orange): "Please enter both start and destination locations."
- ✅ Error (red): Would show on API errors

## Performance Tests

### Lighthouse Audit

Run Lighthouse in Chrome DevTools:

**Expected Scores:**
- ✅ Performance: 90+
- ✅ Accessibility: 95+
- ✅ Best Practices: 95+
- ✅ SEO: 90+
- ✅ PWA: ✓ (all checks pass)

### Load Times

- ✅ First Contentful Paint: < 1s
- ✅ Time to Interactive: < 2s
- ✅ Largest Contentful Paint: < 2.5s

## Security Tests

1. ✅ No mixed content (HTTP/HTTPS)
2. ✅ No XSS vulnerabilities
3. ✅ No sensitive data in console
4. ✅ Service worker only caches appropriate files

## Accessibility Tests

1. ✅ All interactive elements keyboard accessible
2. ✅ Proper color contrast ratios
3. ✅ Semantic HTML structure
4. ✅ Labels for all form inputs
5. ✅ Focus indicators visible

## Known Limitations (Demo Mode)

1. Routes are mock data, not real routing
2. Map is a placeholder, not interactive
3. No real bike-sharing station data
4. Fixed route times (25 mins transit, 18 mins bike)

## Google Maps API Integration

To test with real Google Maps:

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable required APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
   - Geocoding API
3. Update `app.js`:
   ```javascript
   const apiKey = 'YOUR_ACTUAL_API_KEY_HERE';
   ```
4. Test with real locations
5. ✅ Should show interactive map
6. ✅ Should calculate real routes
7. ✅ Should show actual travel times

## Troubleshooting

**Service Worker Not Registering:**
- Ensure serving over HTTPS or localhost
- Check browser console for errors
- Clear site data and reload

**Manifest Not Loading:**
- Verify manifest.json is valid JSON
- Check file path is correct
- Ensure proper MIME type (application/manifest+json)

**Icons Not Showing:**
- Verify SVG files exist in /icons directory
- Check file paths in manifest.json
- Ensure server can serve SVG files

**Routes Not Loading:**
- Check console for JavaScript errors
- Verify all required files are present
- Test with different locations

## Success Criteria

All tests should pass:
- ✅ App loads without errors
- ✅ Routes can be found and displayed
- ✅ PWA can be installed on devices
- ✅ Service worker caches files correctly
- ✅ Works offline after first visit
- ✅ Responsive on all screen sizes
- ✅ Accessible via keyboard
- ✅ Fast performance (< 2s load time)
- ✅ No console errors
- ✅ Manifest valid and complete

## Automated Testing

For automated tests, consider:
- Jest for unit tests
- Playwright for E2E tests
- Lighthouse CI for performance
- axe-core for accessibility

Example Playwright test:
```javascript
test('should find routes', async ({ page }) => {
  await page.goto('http://localhost:8000');
  await page.fill('[placeholder="Enter start location"]', 'Central Park');
  await page.fill('[placeholder="Enter destination"]', 'Times Square');
  await page.click('text=Find Best Route');
  await expect(page.locator('text=Route Options')).toBeVisible();
});
```
