// QuickTravel PWA - Main Application Logic

// App state
const appState = {
    map: null,
    directionsService: null,
    directionsRenderer: null,
    geocoder: null,
    routes: [],
    deferredPrompt: null
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    registerServiceWorker();
    setupInstallPrompt();
});

// Initialize application
function initApp() {
    console.log('QuickTravel initializing...');
    
    // Setup event listeners
    document.getElementById('findRoute').addEventListener('click', findRoutes);
    document.getElementById('start').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') findRoutes();
    });
    document.getElementById('destination').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') findRoutes();
    });
    
    // Initialize map placeholder
    initMapPlaceholder();
    
    // Load Google Maps API dynamically if API key is available
    loadGoogleMapsAPI();
}

// Register service worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showStatus('New version available! Reload to update.', 'info');
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// Setup install prompt for PWA
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        appState.deferredPrompt = e;
        
        // Show install button
        const installPrompt = document.getElementById('installPrompt');
        installPrompt.classList.remove('hidden');
        
        document.getElementById('installBtn').addEventListener('click', async () => {
            if (appState.deferredPrompt) {
                appState.deferredPrompt.prompt();
                const { outcome } = await appState.deferredPrompt.userChoice;
                console.log(`Install prompt: ${outcome}`);
                appState.deferredPrompt = null;
                installPrompt.classList.add('hidden');
            }
        });
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        showStatus('App installed! You can now use it from your home screen.', 'success');
    });
}

// Initialize map placeholder
function initMapPlaceholder() {
    const mapEl = document.getElementById('map');
    mapEl.innerHTML = '<div style="text-align: center; padding: 20px;">🗺️ Map will appear here after finding routes</div>';
}

// Load Google Maps API
function loadGoogleMapsAPI() {
    // Note: In production, you should use your own API key
    // For demo purposes, we'll use a mock implementation
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
    
    if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.log('Using mock Google Maps implementation');
        initMockGoogleMaps();
        return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initGoogleMaps;
    script.onerror = () => {
        console.error('Failed to load Google Maps API');
        initMockGoogleMaps();
    };
    document.head.appendChild(script);
}

// Initialize real Google Maps
function initGoogleMaps() {
    console.log('Google Maps API loaded');
    
    const mapOptions = {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
        zoom: 13,
        mapTypeControl: false,
        fullscreenControl: false
    };
    
    appState.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    appState.directionsService = new google.maps.DirectionsService();
    appState.directionsRenderer = new google.maps.DirectionsRenderer({
        map: appState.map,
        suppressMarkers: false
    });
    appState.geocoder = new google.maps.Geocoder();
    
    showStatus('Maps ready! Enter locations to find routes.', 'success');
}

// Initialize mock Google Maps (for demo without API key)
function initMockGoogleMaps() {
    console.log('Using mock maps implementation');
    showStatus('Demo mode: Enter locations to see sample routes.', 'info');
}

// Find routes between start and destination
async function findRoutes() {
    const start = document.getElementById('start').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const includeBikeSharing = document.getElementById('includeBikeSharing').checked;
    
    if (!start || !destination) {
        showStatus('Please enter both start and destination locations.', 'warning');
        return;
    }
    
    // Show loading state
    const findBtn = document.getElementById('findRoute');
    findBtn.disabled = true;
    findBtn.classList.add('loading');
    findBtn.textContent = 'Finding Routes';
    
    showStatus('Finding the best routes for you...', 'info');
    
    try {
        // If Google Maps is loaded, use real API
        if (appState.directionsService && typeof google !== 'undefined') {
            await findRoutesWithGoogleMaps(start, destination, includeBikeSharing);
        } else {
            // Use mock implementation
            await findRoutesWithMock(start, destination, includeBikeSharing);
        }
    } catch (error) {
        console.error('Error finding routes:', error);
        showStatus('Error finding routes. Please try again.', 'error');
    } finally {
        // Reset button state
        findBtn.disabled = false;
        findBtn.classList.remove('loading');
        findBtn.textContent = 'Find Best Route';
    }
}

// Find routes using Google Maps API
async function findRoutesWithGoogleMaps(start, destination, includeBikeSharing) {
    const routes = [];
    
    // Request transit route
    const transitRequest = {
        origin: start,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
            modes: ['BUS', 'SUBWAY', 'TRAIN']
        }
    };
    
    // Request bicycling route
    const bikeRequest = {
        origin: start,
        destination: destination,
        travelMode: google.maps.TravelMode.BICYCLING
    };
    
    try {
        // Get transit route
        const transitResult = await new Promise((resolve, reject) => {
            appState.directionsService.route(transitRequest, (result, status) => {
                if (status === 'OK') resolve(result);
                else reject(status);
            });
        });
        
        routes.push(formatRoute(transitResult, 'transit'));
        
        // Get bike route if requested
        if (includeBikeSharing) {
            const bikeResult = await new Promise((resolve, reject) => {
                appState.directionsService.route(bikeRequest, (result, status) => {
                    if (status === 'OK') resolve(result);
                    else reject(status);
                });
            });
            
            routes.push(formatRoute(bikeResult, 'bike'));
        }
        
        displayRoutes(routes);
        
        // Display first route on map
        if (routes.length > 0) {
            appState.directionsRenderer.setDirections(transitResult);
        }
        
    } catch (error) {
        console.error('Google Maps error:', error);
        throw error;
    }
}

// Find routes using mock data
async function findRoutesWithMock(start, destination, includeBikeSharing) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const routes = [];
    
    // Mock transit route
    routes.push({
        type: 'transit',
        duration: '25 mins',
        distance: '4.2 km',
        steps: [
            'Walk to nearest station (3 mins)',
            'Take subway/bus (18 mins)',
            'Walk to destination (4 mins)'
        ],
        isFastest: false
    });
    
    // Mock bike-sharing route
    if (includeBikeSharing) {
        routes.push({
            type: 'bike',
            duration: '18 mins',
            distance: '3.8 km',
            steps: [
                'Walk to bike station (2 mins)',
                'Bike ride (14 mins)',
                'Walk from bike station (2 mins)'
            ],
            isFastest: true,
            savings: 'Save 7 mins with bike-sharing!'
        });
    }
    
    displayRoutes(routes);
    updateMapWithMockRoute(start, destination);
}

// Format route data from Google Maps response
function formatRoute(result, type) {
    const route = result.routes[0];
    const leg = route.legs[0];
    
    return {
        type: type,
        duration: leg.duration.text,
        distance: leg.distance.text,
        steps: leg.steps.map(step => step.instructions.replace(/<[^>]*>/g, '')),
        isFastest: false
    };
}

// Display routes in the UI
function displayRoutes(routes) {
    if (routes.length === 0) {
        showStatus('No routes found. Please try different locations.', 'warning');
        return;
    }
    
    // Find fastest route
    routes.forEach(route => {
        route.isFastest = false;
    });
    
    if (routes.length > 1) {
        // Simple comparison based on duration (assumes format like "25 mins")
        const durations = routes.map(r => parseInt(r.duration));
        const minDuration = Math.min(...durations);
        const fastestIndex = durations.indexOf(minDuration);
        routes[fastestIndex].isFastest = true;
    }
    
    const resultsSection = document.getElementById('results');
    const routesList = document.getElementById('routesList');
    
    routesList.innerHTML = routes.map((route, index) => `
        <div class="route-card ${route.type}-route" data-index="${index}">
            <div class="route-header">
                <span class="route-type">
                    ${route.type === 'bike' ? '🚴 Bike-Sharing Route' : '🚇 Transit Route'}
                </span>
                <span class="route-duration">${route.duration}</span>
            </div>
            <div class="route-details">
                <div><strong>Distance:</strong> ${route.distance}</div>
                <div style="margin-top: 8px;"><strong>Steps:</strong></div>
                <ol style="margin-left: 20px; margin-top: 4px;">
                    ${route.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
                ${route.isFastest ? '<span class="route-badge">⚡ FASTEST</span>' : ''}
                ${route.savings ? `<div style="margin-top: 8px; color: var(--secondary-color); font-weight: 600;">${route.savings}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    resultsSection.classList.remove('hidden');
    
    // Add click handlers to route cards
    document.querySelectorAll('.route-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = card.getAttribute('data-index');
            selectRoute(index);
        });
    });
    
    appState.routes = routes;
    showStatus('Routes found! Click on a route to see details.', 'success');
}

// Select a specific route
function selectRoute(index) {
    const route = appState.routes[index];
    console.log('Selected route:', route);
    
    // Highlight selected card
    document.querySelectorAll('.route-card').forEach(card => {
        card.style.backgroundColor = '';
    });
    document.querySelector(`[data-index="${index}"]`).style.backgroundColor = '#e3f2fd';
    
    showStatus(`Selected ${route.type} route (${route.duration})`, 'info');
}

// Update map with mock route visualization
function updateMapWithMockRoute(start, destination) {
    const mapEl = document.getElementById('map');
    mapEl.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🗺️</div>
            <div style="font-size: 16px; margin-bottom: 10px;">
                <strong>Route Preview</strong>
            </div>
            <div style="font-size: 14px; color: var(--text-light);">
                From: ${start}<br>
                To: ${destination}
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: var(--text-light);">
                Add your Google Maps API key to see interactive map
            </div>
        </div>
    `;
}

// Show status message
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.classList.remove('hidden');
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 5000);
    }
}

// Bike-sharing route optimization logic
function optimizeWithBikeSharing(transitRoute, bikeRoute) {
    // Calculate time savings
    const transitTime = parseRouteTime(transitRoute.duration);
    const bikeTime = parseRouteTime(bikeRoute.duration);
    
    if (bikeTime < transitTime) {
        const savings = transitTime - bikeTime;
        return {
            isFaster: true,
            savings: `${savings} mins`,
            recommendation: 'bike'
        };
    }
    
    return {
        isFaster: false,
        recommendation: 'transit'
    };
}

// Parse route time string to minutes
function parseRouteTime(timeString) {
    const match = timeString.match(/(\d+)\s*min/);
    return match ? parseInt(match[1]) : 0;
}

// Handle offline status
window.addEventListener('online', () => {
    showStatus('Back online!', 'success');
});

window.addEventListener('offline', () => {
    showStatus('You are offline. Some features may be limited.', 'warning');
});

console.log('QuickTravel PWA loaded successfully');
