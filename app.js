// app.js
import { generateCandidates } from './src/engine.js';
import { CompositeProvider, createFixtureProvider, FixtureGeocoder } from './src/providers.js';
import { londonFixtures } from './src/fixtures.london.js';
import { TflBikePointAdapter } from './src/adapters/tflBikePoint.js';
import { TflArrivalsAdapter } from './src/adapters/tflArrivals.js';
import { DocklessGbfsAdapter } from './src/adapters/docklessGbfs.js';
import { GoogleGeocoder } from './src/adapters/googleGeocoder.js';

const fixtures = londonFixtures;
const provider = createLiveProvider() ?? createFixtureProvider(fixtures);

const form = document.querySelector('#routeForm');
const fromInput = document.querySelector('#from');
const toInput = document.querySelector('#to');
const resultsContainer = document.querySelector('#results');
const errorContainer = document.querySelector('#error');
const submitButton = document.querySelector('#submitRoute');

prefillDefaults();
wireListeners();
registerServiceWorker();

function wireListeners() {
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await runQuery();
  });
}

async function runQuery() {
  clearUi();
  setLoading(true);
  try {
    const from = fromInput.value.trim();
    const to = toInput.value.trim();
    const routes = await generateCandidates(provider, { from, to }, fixtures);
    renderRoutes(routes);
    logRoutes(routes);
  } catch (error) {
    console.error(error);
    renderError(error.message || 'Failed to generate routes');
  } finally {
    setLoading(false);
  }
}

function renderRoutes(routes) {
  if (!Array.isArray(routes) || !routes.length) {
    renderError('No routes returned by engine');
    return;
  }

  errorContainer.classList.add('hidden');
  resultsContainer.innerHTML = '';

  routes.forEach((route) => {
    const card = document.createElement('article');
    card.className = 'route-card';
    card.dataset.kind = route.kind;

    const header = document.createElement('header');
    header.innerHTML = 
      <h3></h3>
      <p> min |  | GBP  | g CO2 | score </p>
    ;
    card.appendChild(header);

    const stepsList = document.createElement('ol');
    stepsList.className = 'route-steps';
    route.steps.forEach((step) => {
      const li = document.createElement('li');
      li.innerHTML = ${emojiFor(step.mode)} <span class="step-text"></span> <span class="step-metric"> min</span>;
      stepsList.appendChild(li);
    });
    card.appendChild(stepsList);

    resultsContainer.appendChild(card);
  });
}

function renderError(message) {
  resultsContainer.innerHTML = '';
  errorContainer.textContent = message;
  errorContainer.classList.remove('hidden');
}

function clearUi() {
  resultsContainer.innerHTML = '';
  errorContainer.textContent = '';
  errorContainer.classList.add('hidden');
}

function setLoading(isLoading) {
  if (!submitButton) return;
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Finding routes...' : 'Find routes';
}

function formatTransfers(transfers) {
  if (transfers === 1) return '1 transfer';
  return ${transfers} transfers;
}

function emojiFor(mode) {
  switch (mode) {
    case 'walk':
      return '??';
    case 'bike':
      return '??';
    case 'bus':
      return '??';
    case 'rail':
      return '??';
    case 'wait':
      return '??';
    default:
      return '??';
  }
}

function logRoutes(routes) {
  const table = routes.map((route) => ({
    kind: route.kind,
    minutes: route.minutes,
    transfers: route.transfers,
    cost: route.cost,
    co2: route.co2,
    score: Math.round(route.score),
  }));
  console.table(table);
}

function prefillDefaults() {
  if (fromInput && !fromInput.value) fromInput.value = 'Don Gratton House';
  if (toInput && !toInput.value) toInput.value = 'Paddington';
}

function registerServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').catch((err) => {
    console.warn('Service worker registration failed', err);
  });
}

function createLiveProvider() {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return null;
  }

  try {
    const geocoder = GoogleGeocoder.fromWindow() ?? new FixtureGeocoder(fixtures);
    const bikeDockAdapter = new TflBikePointAdapter({ fetchImpl: fetch });
    const docklessAdapters = [
      new DocklessGbfsAdapter({ baseUrl: 'https://gbfs.lime.bike/api/gbfs/v1/GB/en', provider: 'lime', fetchImpl: fetch }),
      new DocklessGbfsAdapter({ baseUrl: 'https://gbfs.getforest.com/gbfs/en', provider: 'forest', fetchImpl: fetch }),
    ];
    const hubStopLookup = fixtures.hubs.reduce((acc, hub) => {
      if (hub.stopId) acc[hub.id] = hub.stopId;
      return acc;
    }, {});
    const defaultDurations = fixtures.express.reduce((acc, hop) => {
      acc[hop.from] = acc[hop.from] || {};
      acc[hop.from][hop.to] = hop.minutes;
      return acc;
    }, {});
    const transitAdapter = new TflArrivalsAdapter({ fetchImpl: fetch, hubStopLookup, defaultDurations });

    return new CompositeProvider({
      fixtures,
      geocoder,
      bikeDockAdapter,
      docklessAdapters,
      transitAdapter,
    });
  } catch (error) {
    console.warn('Live adapters unavailable, falling back to fixtures', error);
    return null;
  }
}

window.renderError = renderError;
