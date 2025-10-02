// tests/engine.spec.js
import assert from 'node:assert/strict';
import { generateCandidates } from '../src/engine.js';
import { createFixtureProvider } from '../src/providers.js';
import { londonFixtures } from '../src/fixtures.london.js';

export async function runEngineSuite(log = () => {}) {
  await testCase('Medium (hybrid viable)', log, async () => {
    const routes = await runQuery('Don Gratton House', 'Paddington');
    assertCount(routes, 3, 4);
    assertRouteKind(routes, 'hybrid_bike_rail');
    assertSpread(routes, 10);
    assertBikeIntegrity(routes);
  });

  await testCase('Short (bike dominant)', log, async () => {
    const routes = await runQuery('Liverpool Street', 'Bank');
    assertCount(routes, 3, 4);
    const bike = assertRouteKind(routes, 'bike_direct');
    const fastest = Math.min(...routes.map((r) => r.minutes));
    assert.ok(bike.minutes <= fastest + 2, 'bike route should be among the fastest');
    assertBikeIntegrity(routes);
  });

  await testCase('Cross-city diversity', log, async () => {
    const routes = await runQuery('Whitechapel', 'Oxford Circus');
    assertCount(routes, 3, 4);
    assertDistinctKinds(routes, 3);
    assertRouteKind(routes, 'walk_only');
    assertSpread(routes, 8);
    assertBikeIntegrity(routes);
  });

  await testCase('Hub express connectivity', log, async () => {
    const routes = await runQuery("King's Cross", 'Victoria');
    const hybrid = routes.find((r) => r.kind === 'hybrid_bike_rail');
    const lastMile = routes.find((r) => r.kind === 'rail_plus_bike_lastmile');
    assert.ok(hybrid || lastMile, 'expected express-or-last-mile hybrid');
    assertDistinctKinds(routes, 3);
    assertBikeIntegrity(routes);
  });
}

async function runQuery(from, to) {
  const provider = createFixtureProvider(londonFixtures);
  return generateCandidates(provider, { from, to }, londonFixtures);
}

async function testCase(name, log, fn) {
  try {
    await fn();
    log(`? ${name}`);
  } catch (error) {
    log(`? ${name}`);
    throw error;
  }
}

function assertCount(routes, min, max) {
  assert.ok(routes.length >= min && routes.length <= max, `expected between ${min} and ${max} routes`);
}

function assertRouteKind(routes, kind) {
  const match = routes.find((route) => route.kind === kind);
  assert.ok(match, `expected route kind ${kind}`);
  return match;
}

function assertDistinctKinds(routes, minKinds) {
  const unique = new Set(routes.map((route) => route.kind));
  assert.ok(unique.size >= minKinds, `expected at least ${minKinds} distinct route kinds`);
}

function assertSpread(routes, threshold) {
  const mins = routes.map((route) => route.minutes);
  const spread = Math.max(...mins) - Math.min(...mins);
  assert.ok(spread >= threshold, `expected time spread >= ${threshold} minutes (was ${spread})`);
}

function assertBikeIntegrity(routes) {
  routes.forEach((route) => {
    if (route.kind.includes('bike')) {
      const hasBike = route.steps.some((step) => step.mode === 'bike');
      assert.ok(hasBike, `route ${route.kind} missing bike step`);
    }
  });
}
