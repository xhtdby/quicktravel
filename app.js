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
    const apiKey = 'AIzaSyCf9okaNlSNpA2vdNKOVPHUqEUBcZyWTL0';
    
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
    
    // Get base transit route with alternatives
    const transitRequest = {
        origin: start,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
            modes: ['BUS', 'SUBWAY', 'TRAIN']
        },
        provideRouteAlternatives: true
    };
    
    try {
        // Get transit route
        const transitResult = await new Promise((resolve, reject) => {
            appState.directionsService.route(transitRequest, (result, status) => {
                if (status === 'OK') resolve(result);
                else reject(status);
            });
        });
        
        // Add base transit route
        const baseTransit = formatRoute(transitResult, 'transit');
        routes.push(baseTransit);
        
        if (includeBikeSharing) {
            try {
                console.log('Starting route optimization analysis...');
                // Analyze transit route for bike-sharing optimization opportunities
                const optimizedRoutes = await analyzeAndOptimizeRoute(transitResult, start, destination);
                console.log('Optimization completed, found routes:', optimizedRoutes.length);
                routes.push(...optimizedRoutes);
            } catch (optimizationError) {
                console.error('Route optimization failed:', optimizationError);
                // Fallback: Add a simple bike route
                const bikeRequest = {
                    origin: start,
                    destination: destination,
                    travelMode: google.maps.TravelMode.BICYCLING
                };
                
                const bikeResult = await new Promise((resolve, reject) => {
                    appState.directionsService.route(bikeRequest, (result, status) => {
                        if (status === 'OK') resolve(result);
                        else reject(status);
                    });
                });
                
                routes.push(formatRoute(bikeResult, 'bike'));
            }
        }
        
        displayRoutes(routes);
        
        // Display best route on map
        if (routes.length > 0) {
            const bestRoute = routes.find(r => r.isFastest) || routes[0];
            if (bestRoute.directionsResult) {
                appState.directionsRenderer.setDirections(bestRoute.directionsResult);
            } else {
                appState.directionsRenderer.setDirections(transitResult);
            }
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
    
    // Mock standard transit route
    routes.push({
        type: 'transit',
        duration: '28 mins',
        distance: '4.2 km',
        steps: [
            '🚶 Walk to Central Station (6 mins)',
            '🚇 Blue Line: Central to Park Street (12 mins)',
            '🚌 Bus #47: Park Street to Mall Stop (7 mins)', 
            '🚶 Walk to destination (3 mins)'
        ],
        isFastest: false
    });
    
    // Mock AI-optimized multi-modal routes
    if (includeBikeSharing) {
        // Optimized route (best overall score)
        routes.push({
            type: 'optimized',
            duration: '19 mins',
            distance: '4.0 km',
            steps: [
                '🚴 Bike from Station A to Central Station (3 mins)',
                '🚇 Blue Line: Central to Park Street (12 mins)',
                '🚴 Bike from Station B to destination (4 mins)'
            ],
            isFastest: true,
            savings: '⚡ Save 9 mins with AI-optimized routing!',
            cost: '$1.00'
        });
        
        // Time-focused route (absolute fastest)
        routes.push({
            type: 'time_focused', 
            duration: '17 mins',
            distance: '3.8 km',
            steps: [
                '🚗 Ride-share to Park Street (8 mins)',
                '🚴 Bike from Station C to destination (9 mins)'
            ],
            isFastest: false,
            savings: '⚡ Fastest possible route!',
            cost: '$12.50'
        });
        
        // Bike-focused route (eco-friendly)
        routes.push({
            type: 'bike_focused',
            duration: '22 mins', 
            distance: '4.1 km',
            steps: [
                '🚴 Bike from Station A to Station D (15 mins)',
                '🚶 Walk to destination (7 mins)'
            ],
            isFastest: false,
            savings: 'Zero emissions route!',
            cost: '$0.50'
        });
    }
    
    displayRoutes(routes);
    updateMapWithMockRoute(start, destination);
}

// Advanced Multi-Modal Journey Optimizer
class JourneyOptimizer {
    constructor() {
        this.bikeStations = new Map(); // Cache for bike station data
        this.realTimeData = new Map(); // Cache for real-time transit data
    }

    async optimizeJourney(baseTransitResult, start, destination) {
        try {
            console.log('Optimizing journey from', start, 'to', destination);
            
            const route = baseTransitResult.routes?.[0];
            if (!route) {
                throw new Error('No route found in transit result');
            }
            
            const leg = route.legs?.[0];
            if (!leg) {
                throw new Error('No leg found in route');
            }
            
            console.log('Processing route with', leg.steps?.length || 0, 'steps');
            
            // Break journey into segments for analysis
            const segments = await this.segmentizeJourney(leg);
            
            // Analyze each segment for optimal transport mode
            const optimizedSegments = await Promise.all(
                segments.map(segment => this.analyzeSegment(segment))
            );
            
            console.log('Analyzed', optimizedSegments.length, 'segments');
            
            // Generate alternative routes using dynamic programming approach
            const alternatives = await this.generateOptimalRoutes(optimizedSegments, start, destination, leg);
            
            console.log('Generated', alternatives.length, 'alternative routes');
            return alternatives;
            
        } catch (error) {
            console.error('Journey optimization failed:', error);
            throw error;
        }
    }

    async segmentizeJourney(leg) {
        const segments = [];
        let currentPosition = leg.start_location;
        
        console.log('Segmentizing journey with', leg.steps.length, 'steps');
        
        for (let i = 0; i < leg.steps.length; i++) {
            const step = leg.steps[i];
            const nextPosition = step.end_location;
            
            // Safely extract values with fallbacks
            const segment = {
                id: i,
                startLocation: currentPosition,
                endLocation: nextPosition,
                originalStep: step,
                distance: step.distance?.value || 1000, // meters - fallback to 1km
                duration: step.duration?.value || 600, // seconds - fallback to 10min
                mode: step.travel_mode || 'UNKNOWN',
                transitDetails: step.transit || null
            };
            
            // Add contextual information
            try {
                segment.context = await this.getSegmentContext(segment, i, leg.steps);
            } catch (contextError) {
                console.warn('Failed to get segment context:', contextError);
                segment.context = { 
                    isFirst: i === 0, 
                    isLast: i === leg.steps.length - 1,
                    totalJourneyTime: leg.duration?.value || 1800
                };
            }
            
            segments.push(segment);
            currentPosition = nextPosition;
        }
        
        console.log('Created', segments.length, 'segments');
        return segments;
    }

    async getSegmentContext(segment, index, allSteps) {
        const context = {
            isFirst: index === 0,
            isLast: index === allSteps.length - 1,
            previousSegment: index > 0 ? allSteps[index - 1] : null,
            nextSegment: index < allSteps.length - 1 ? allSteps[index + 1] : null,
            totalJourneyTime: allSteps.reduce((sum, step) => sum + step.duration.value, 0)
        };
        
        // Add real-time context
        if (segment.mode === 'TRANSIT') {
            context.realTimeDelay = await this.getTransitDelay(segment.transitDetails);
            context.crowdingLevel = await this.getCrowdingLevel(segment.transitDetails);
        }
        
        return context;
    }

    async analyzeSegment(segment) {
        const alternatives = [];
        
        // Always include original mode as baseline
        alternatives.push({
            mode: segment.mode,
            duration: segment.duration,
            cost: this.calculateCost(segment, segment.mode),
            comfort: this.calculateComfort(segment, segment.mode),
            reliability: this.calculateReliability(segment, segment.mode),
            carbonFootprint: this.calculateCarbonFootprint(segment, segment.mode),
            feasible: true,
            details: segment.originalStep
        });
        
        // Analyze bike-sharing alternative
        const bikeAlternative = await this.analyzeBikeOption(segment);
        if (bikeAlternative.feasible) {
            alternatives.push(bikeAlternative);
        }
        
        // Analyze walking alternative (for short segments)
        if (segment.distance < 1000) { // < 1km
            const walkAlternative = await this.analyzeWalkOption(segment);
            alternatives.push(walkAlternative);
        }
        
        // Analyze ride-sharing for specific conditions
        const rideAlternative = await this.analyzeRideOption(segment);
        if (rideAlternative.feasible) {
            alternatives.push(rideAlternative);
        }
        
        // Score and rank alternatives
        alternatives.forEach(alt => {
            alt.score = this.calculateOverallScore(alt, segment.context);
        });
        
        alternatives.sort((a, b) => b.score - a.score);
        
        return {
            segment: segment,
            alternatives: alternatives,
            recommended: alternatives[0]
        };
    }

    async analyzeBikeOption(segment) {
        const nearbyStations = await this.findNearbyBikeStations(
            segment.startLocation, 
            segment.endLocation
        );
        
        if (nearbyStations.length === 0) {
            return { feasible: false, reason: 'No bike stations available' };
        }
        
        // Calculate bike routing time
        const bikeRoute = await this.calculateBikeRoute(
            nearbyStations.pickup,
            nearbyStations.dropoff,
            segment
        );
        
        const totalDuration = 
            nearbyStations.walkToPickup + 
            bikeRoute.duration + 
            nearbyStations.walkFromDropoff + 
            60; // 1 min for bike pickup/docking
        
        return {
            mode: 'BIKE_SHARE',
            duration: totalDuration,
            cost: this.calculateCost(segment, 'BIKE_SHARE'),
            comfort: this.calculateComfort(segment, 'BIKE_SHARE'),
            reliability: this.calculateReliability(segment, 'BIKE_SHARE'),
            carbonFootprint: this.calculateCarbonFootprint(segment, 'BIKE_SHARE'),
            feasible: totalDuration < segment.duration * 1.5, // Only if not >50% slower
            details: {
                pickupStation: nearbyStations.pickup,
                dropoffStation: nearbyStations.dropoff,
                bikeRoute: bikeRoute,
                estimatedSavings: segment.duration - totalDuration
            }
        };
    }

    async findNearbyBikeStations(startLocation, endLocation) {
        // In a real implementation, this would query bike-sharing APIs
        // For now, simulate station availability
        const mockStations = await this.getMockBikeStations(startLocation, endLocation);
        
        if (!mockStations.pickup || !mockStations.dropoff) {
            return [];
        }
        
        return {
            pickup: mockStations.pickup,
            dropoff: mockStations.dropoff,
            walkToPickup: mockStations.walkToPickup,
            walkFromDropoff: mockStations.walkFromDropoff
        };
    }

    async getMockBikeStations(startLocation, endLocation) {
        // Simulate real-time bike station data
        const availability = Math.random();
        
        if (availability < 0.3) {
            return { pickup: null, dropoff: null }; // No bikes/docks available
        }
        
        return {
            pickup: {
                id: 'BS001',
                name: 'Station Near Start',
                bikesAvailable: Math.floor(Math.random() * 10) + 1,
                docksAvailable: Math.floor(Math.random() * 5) + 1
            },
            dropoff: {
                id: 'BS002', 
                name: 'Station Near End',
                bikesAvailable: Math.floor(Math.random() * 8) + 1,
                docksAvailable: Math.floor(Math.random() * 6) + 1
            },
            walkToPickup: Math.random() * 180 + 60, // 1-4 minutes
            walkFromDropoff: Math.random() * 180 + 60
        };
    }

    async calculateBikeRoute(pickupStation, dropoffStation, segment) {
        // In real implementation, use Google Maps Directions API with BICYCLING mode
        const distance = segment.distance * 0.9; // Assume bike route is ~90% of walking distance
        const avgBikeSpeed = 4.17; // 15 km/h in m/s
        
        return {
            duration: distance / avgBikeSpeed,
            distance: distance,
            elevation: Math.random() * 50, // Mock elevation data
            bikeScore: this.calculateBikeScore(segment, distance)
        };
    }

    calculateBikeScore(segment, distance) {
        let score = 100;
        
        // Weather impact (mock)
        const weather = Math.random();
        if (weather < 0.2) score -= 30; // Bad weather
        
        // Distance penalty
        if (distance > 3000) score -= 20; // >3km gets harder
        
        // Traffic/safety (mock based on time of day)
        const hour = new Date().getHours();
        if (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19) {
            score -= 15; // Rush hour
        }
        
        return Math.max(score, 0);
    }

    async analyzeWalkOption(segment) {
        const walkSpeed = 1.39; // 5 km/h in m/s
        const walkDuration = segment.distance / walkSpeed;
        
        return {
            mode: 'WALKING',
            duration: walkDuration,
            cost: 0,
            comfort: segment.distance < 500 ? 80 : 60 - (segment.distance / 100),
            reliability: 95,
            carbonFootprint: 0,
            feasible: segment.distance < 1500, // Max 1.5km walking
            details: { distance: segment.distance }
        };
    }

    async analyzeRideOption(segment) {
        // Only consider ride-sharing for specific scenarios
        const shouldConsider = 
            segment.distance > 2000 || // Long distance
            segment.context.realTimeDelay > 600 || // Major transit delays
            (segment.context.isLast && segment.context.totalJourneyTime > 3600); // Long journey
        
        if (!shouldConsider) {
            return { feasible: false, reason: 'Not cost-effective for this segment' };
        }
        
        const rideDuration = segment.distance / 8.33 + 180; // 30km/h + 3min pickup
        
        return {
            mode: 'RIDE_SHARE',
            duration: rideDuration,
            cost: Math.max(segment.distance * 0.002, 5), // $2 per km, min $5
            comfort: 90,
            reliability: 85,
            carbonFootprint: segment.distance * 0.2,
            feasible: true,
            details: { estimatedCost: Math.max(segment.distance * 0.002, 5) }
        };
    }

    calculateOverallScore(alternative, context) {
        const weights = {
            time: 0.4,
            cost: 0.2,
            comfort: 0.15,
            reliability: 0.15,
            environmental: 0.1
        };
        
        // Normalize scores (0-100)
        const timeScore = Math.max(0, 100 - (alternative.duration / 60)); // Penalty per minute
        const costScore = Math.max(0, 100 - alternative.cost * 10); // Penalty per dollar
        const comfortScore = alternative.comfort || 50;
        const reliabilityScore = alternative.reliability || 50;
        const environmentalScore = Math.max(0, 100 - alternative.carbonFootprint);
        
        return (
            timeScore * weights.time +
            costScore * weights.cost +
            comfortScore * weights.comfort +
            reliabilityScore * weights.reliability +
            environmentalScore * weights.environmental
        );
    }

    async generateOptimalRoutes(analyzedSegments, start, destination, originalLeg) {
        const routes = [];
        
        // Calculate original route duration for comparison
        const originalDuration = originalLeg.duration?.value || 1800;
        const originalDistance = originalLeg.distance?.text || '4.2 km';
        
        // Generate base optimized route (best alternative for each segment)
        const optimizedRoute = {
            type: 'optimized',
            segments: analyzedSegments.map(as => as.recommended),
            totalDuration: analyzedSegments.reduce((sum, as) => sum + as.recommended.duration, 0),
            totalCost: analyzedSegments.reduce((sum, as) => sum + as.recommended.cost, 0),
            originalDuration: originalDuration,
            totalDistance: originalDistance,
            description: 'AI-Optimized Multi-Modal Route'
        };
        
        // Generate bike-focused alternative
        const bikeFocusedRoute = await this.generateBikeFocusedRoute(analyzedSegments);
        if (bikeFocusedRoute) {
            bikeFocusedRoute.originalDuration = originalDuration;
            bikeFocusedRoute.totalDistance = originalDistance;
        }
        
        // Generate time-focused alternative
        const timeFocusedRoute = await this.generateTimeFocusedRoute(analyzedSegments);
        if (timeFocusedRoute) {
            timeFocusedRoute.originalDuration = originalDuration;
            timeFocusedRoute.totalDistance = originalDistance;
        }
        
        // Format routes for display
        routes.push(this.formatOptimizedRoute(optimizedRoute));
        
        if (bikeFocusedRoute) {
            routes.push(this.formatOptimizedRoute(bikeFocusedRoute));
        }
        
        if (timeFocusedRoute && timeFocusedRoute.totalDuration !== optimizedRoute.totalDuration) {
            routes.push(this.formatOptimizedRoute(timeFocusedRoute));
        }
        
        return routes;
    }

    formatOptimizedRoute(route) {
        const steps = route.segments.map((segment, i) => {
            const mode = this.getModeIcon(segment.mode);
            const duration = Math.ceil(segment.duration / 60);
            
            if (segment.mode === 'BIKE_SHARE' && segment.details.pickupStation) {
                return `${mode} Bike from ${segment.details.pickupStation.name} (${duration}min)`;
            } else if (segment.mode === 'TRANSIT') {
                return `${mode} ${segment.details.instructions.replace(/<[^>]*>/g, '')}`;
            } else {
                return `${mode} ${segment.details.instructions?.replace(/<[^>]*>/g, '') || `${segment.mode.toLowerCase()} segment`} (${duration}min)`;
            }
        });
        
        const totalMinutes = Math.ceil(route.totalDuration / 60);
        const savings = route.originalDuration ? Math.max(0, (route.originalDuration - route.totalDuration) / 60) : 0;
        
        return {
            type: route.type,
            duration: `${totalMinutes} mins`,
            distance: route.totalDistance || '4.2 km', // Mock for now
            steps: steps,
            isFastest: route.type === 'optimized',
            savings: savings > 1 ? `⚡ Save ${Math.round(savings)} mins with smart routing!` : null,
            cost: route.totalCost > 0 ? `$${route.totalCost.toFixed(2)}` : 'Free'
        };
    }

    getModeIcon(mode) {
        const icons = {
            'WALKING': '🚶',
            'BIKE_SHARE': '🚴',
            'TRANSIT': '🚇',
            'BUS': '🚌',
            'SUBWAY': '🚇',
            'RIDE_SHARE': '🚗'
        };
        return icons[mode] || '🚶';
    }

    // Utility calculation methods
    calculateCost(segment, mode) {
        const costs = {
            'WALKING': 0,
            'BIKE_SHARE': 0.5, // Per segment
            'TRANSIT': 2.5,
            'RIDE_SHARE': Math.max(segment.distance * 0.002, 5)
        };
        return costs[mode] || 0;
    }

    calculateComfort(segment, mode) {
        // Weather, distance, and other factors
        const base = { 'WALKING': 70, 'BIKE_SHARE': 75, 'TRANSIT': 85, 'RIDE_SHARE': 90 };
        return base[mode] || 50;
    }

    calculateReliability(segment, mode) {
        const base = { 'WALKING': 95, 'BIKE_SHARE': 80, 'TRANSIT': 75, 'RIDE_SHARE': 85 };
        return base[mode] || 50;
    }

    calculateCarbonFootprint(segment, mode) {
        const emissions = { 'WALKING': 0, 'BIKE_SHARE': 0, 'TRANSIT': segment.distance * 0.05, 'RIDE_SHARE': segment.distance * 0.2 };
        return emissions[mode] || 0;
    }

    async getTransitDelay(transitDetails) {
        // Mock real-time transit data
        return Math.random() < 0.2 ? Math.random() * 300 : 0; // 20% chance of delay
    }

    async getCrowdingLevel(transitDetails) {
        // Mock crowding data
        return Math.random() * 100;
    }
}

// Create global optimizer instance
const journeyOptimizer = new JourneyOptimizer();

// Updated analyze function to use the new algorithm
async function analyzeAndOptimizeRoute(transitResult, start, destination) {
    return await journeyOptimizer.optimizeJourney(transitResult, start, destination);
}

// Additional utility methods for the Journey Optimizer
JourneyOptimizer.prototype.generateBikeFocusedRoute = async function(analyzedSegments) {
    const bikeRoute = {
        type: 'bike_focused',
        segments: [],
        totalDuration: 0,
        totalCost: 0,
        description: 'Bike-Optimized Route'
    };
    
    for (const segmentAnalysis of analyzedSegments) {
        // Prefer bike alternatives where available and reasonable
        const bikeOption = segmentAnalysis.alternatives.find(alt => alt.mode === 'BIKE_SHARE');
        
        if (bikeOption && bikeOption.feasible && bikeOption.score > 60) {
            bikeRoute.segments.push(bikeOption);
        } else {
            bikeRoute.segments.push(segmentAnalysis.recommended);
        }
    }
    
    bikeRoute.totalDuration = bikeRoute.segments.reduce((sum, seg) => sum + seg.duration, 0);
    bikeRoute.totalCost = bikeRoute.segments.reduce((sum, seg) => sum + seg.cost, 0);
    
    return bikeRoute;
};

JourneyOptimizer.prototype.generateTimeFocusedRoute = async function(analyzedSegments) {
    const timeRoute = {
        type: 'time_focused',
        segments: [],
        totalDuration: 0,
        totalCost: 0,
        description: 'Fastest Route'
    };
    
    for (const segmentAnalysis of analyzedSegments) {
        // Always pick the fastest alternative
        const fastestOption = segmentAnalysis.alternatives.reduce((fastest, current) => 
            current.duration < fastest.duration ? current : fastest
        );
        
        timeRoute.segments.push(fastestOption);
    }
    
    timeRoute.totalDuration = timeRoute.segments.reduce((sum, seg) => sum + seg.duration, 0);
    timeRoute.totalCost = timeRoute.segments.reduce((sum, seg) => sum + seg.cost, 0);
    
    return timeRoute;
};

// Format route data from Google Maps response
function formatRoute(result, type) {
    const route = result.routes[0];
    const leg = route.legs[0];
    
    return {
        type: type,
        duration: leg.duration.text,
        distance: leg.distance.text,
        steps: leg.steps.map(step => {
            let instruction = step.instructions.replace(/<[^>]*>/g, '');
            if (step.travel_mode === 'TRANSIT') {
                const transit = step.transit;
                instruction = `${transit.line.vehicle.type === 'BUS' ? '🚌' : '🚇'} ${transit.line.short_name || transit.line.name}: ${instruction}`;
            } else if (step.travel_mode === 'WALKING') {
                instruction = `🚶 ${instruction}`;
            }
            return instruction;
        }),
        isFastest: false,
        directionsResult: result
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
        // Use parseRouteTime for consistent duration parsing
        const durations = routes.map(r => parseRouteTime(r.duration));
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
                    ${route.type === 'optimized' ? '🤖 AI-Optimized Route' :
                      route.type === 'time_focused' ? '⚡ Fastest Route' :
                      route.type === 'bike_focused' ? '🌱 Eco-Friendly Route' :
                      route.type === 'hybrid' ? '🚴🚇 Smart Hybrid Route' : 
                      route.type === 'bike' ? '🚴 Full Bike Route' : 
                      '🚇 Standard Transit Route'}
                </span>
                <span class="route-duration">${route.duration}</span>
            </div>
            <div class="route-details">
                <div><strong>Distance:</strong> ${route.distance}</div>
                ${route.type === 'optimized' ? 
                  '<div style="margin-top: 4px; font-size: 0.9em; color: var(--secondary-color);">🎯 Multi-modal analysis with real-time optimization</div>' :
                  route.type === 'time_focused' ?
                  '<div style="margin-top: 4px; font-size: 0.9em; color: var(--secondary-color);">⚡ Prioritizes speed over cost and comfort</div>' :
                  route.type === 'bike_focused' ?
                  '<div style="margin-top: 4px; font-size: 0.9em; color: var(--secondary-color);">🌱 Maximizes bike-sharing and walking segments</div>' :
                  route.type === 'hybrid' ? 
                  '<div style="margin-top: 4px; font-size: 0.9em; color: var(--secondary-color);">🎯 Optimized with bike-sharing segments</div>' : 
                  ''
                }
                ${route.cost ? 
                  `<div style="margin-top: 4px; font-size: 0.9em; color: var(--text-light);">💰 Estimated cost: ${route.cost}</div>` : 
                  ''
                }
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
