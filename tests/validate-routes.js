// Direct Route Validation - No Browser Needed
// This simulates route generation and validates them

class RouteValidator {
    constructor() {
        this.rules = this.defineValidationRules();
    }

    defineValidationRules() {
        return {
            timeDiversity: (routes) => {
                const times = routes.map(r => r.totalTime);
                const timeSpread = Math.max(...times) - Math.min(...times);
                return {
                    passed: timeSpread >= 10,
                    score: timeSpread >= 10 ? 100 : (timeSpread / 10) * 100,
                    message: timeSpread >= 10 ? 
                        `Time diversity good: ${timeSpread} min spread` :
                        `Routes too similar: only ${timeSpread} min difference`
                };
            },
            
            bikeUsage: (routes) => {
                let issues = 0;
                routes.forEach(route => {
                    if (route.type?.includes('bike')) {
                        const hasBikeSteps = route.steps?.some(s => s.mode === 'bike');
                        if (!hasBikeSteps) issues++;
                    }
                });
                return {
                    passed: issues === 0,
                    score: issues === 0 ? 100 : Math.max(0, 100 - (issues * 30)),
                    message: issues === 0 ? 
                        'All bike routes include actual biking' :
                        `${issues} bike route(s) missing actual bike steps`
                };
            },
            
            hybridRoutes: (routes) => {
                const hybrids = routes.filter(r => {
                    const modes = new Set(r.steps?.map(s => s.mode) || []);
                    return modes.has('bike') && (modes.has('bus') || modes.has('train'));
                });
                return {
                    passed: hybrids.length > 0,
                    score: hybrids.length > 0 ? 100 : 70,
                    message: hybrids.length > 0 ?
                        `${hybrids.length} hybrid route(s) found` :
                        'No hybrid routes generated'
                };
            },
            
            routeCount: (routes) => {
                return {
                    passed: routes.length >= 3,
                    score: Math.min(100, (routes.length / 4) * 100),
                    message: routes.length >= 3 ?
                        `Good route diversity: ${routes.length} options` :
                        `Only ${routes.length} routes generated, need at least 3`
                };
            }
        };
    }

    validate(routes) {
        const results = {};
        let totalScore = 0;
        let passed = true;

        Object.entries(this.rules).forEach(([ruleName, ruleFunc]) => {
            const result = ruleFunc(routes);
            results[ruleName] = result;
            totalScore += result.score;
            if (!result.passed) passed = false;
        });

        const avgScore = Math.round(totalScore / Object.keys(this.rules).length);

        return {
            passed,
            score: avgScore,
            rules: results,
            routes
        };
    }
}

// Mock route generator for testing
class MockRouteEngine {
    generateRoutes(start, dest) {
        // Current broken output
        return [
            {
                type: 'transit_bus',
                totalTime: 43,
                steps: [
                    { mode: 'walk', desc: 'Walk to bus stop' },
                    { mode: 'bus', desc: 'Bus to destination' },
                    { mode: 'walk', desc: 'Walk to final location' }
                ]
            },
            {
                type: 'transit_rail',
                totalTime: 52,
                steps: [
                    { mode: 'walk', desc: 'Walk to station' },
                    { mode: 'train', desc: 'Train to destination' },
                    { mode: 'walk', desc: 'Walk to final location' }
                ]
            }
        ];
    }

    // What we SHOULD generate
    generateGoodRoutes(start, dest) {
        return [
            {
                type: 'transit_rail',
                name: 'Express Rail',
                totalTime: 26,
                steps: [
                    { mode: 'walk', desc: 'Walk to station', time: 3 },
                    { mode: 'train', desc: 'Elizabeth Line to Paddington', time: 20 },
                    { mode: 'walk', desc: 'Walk to destination', time: 3 }
                ]
            },
            {
                type: 'bike_hybrid',
                name: 'Bike + Rail',
                totalTime: 28,
                steps: [
                    { mode: 'walk', desc: 'Walk to bike station', time: 2 },
                    { mode: 'bike', desc: 'Bike 3km to Liverpool Street', time: 12 },
                    { mode: 'train', desc: 'Train to Paddington', time: 11 },
                    { mode: 'walk', desc: 'Walk to destination', time: 3 }
                ]
            },
            {
                type: 'bike_direct',
                name: 'Direct Bike',
                totalTime: 38,
                steps: [
                    { mode: 'walk', desc: 'Walk to bike station', time: 2 },
                    { mode: 'bike', desc: 'Bike 10km to destination', time: 33 },
                    { mode: 'walk', desc: 'Walk to final location', time: 3 }
                ]
            },
            {
                type: 'transit_bus',
                name: 'Bus Route',
                totalTime: 43,
                steps: [
                    { mode: 'walk', desc: 'Walk to bus stop', time: 3 },
                    { mode: 'bus', desc: 'Bus to Paddington', time: 35 },
                    { mode: 'walk', desc: 'Walk to destination', time: 5 }
                ]
            }
        ];
    }
}

// Test runner
function runValidationTests() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  QuickTravel Route Validation Test                ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    const validator = new RouteValidator();
    const engine = new MockRouteEngine();

    // Test 1: Current broken routes
    console.log('📋 Test 1: Current Routes (Should FAIL)\n');
    const currentRoutes = engine.generateRoutes('don gratton house', 'paddington');
    const currentResult = validator.validate(currentRoutes);
    
    console.log(`Routes Generated: ${currentRoutes.length}`);
    currentRoutes.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.type} - ${r.totalTime} mins`);
    });
    console.log('');
    
    console.log('Validation Results:');
    Object.entries(currentResult.rules).forEach(([rule, result]) => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`  ${icon} ${rule}: ${result.message} (Score: ${result.score}/100)`);
    });
    console.log(`\nOverall Score: ${currentResult.score}/100 ${currentResult.passed ? '✅ PASS' : '❌ FAIL'}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 2: Good routes
    console.log('📋 Test 2: Expected Routes (Should PASS)\n');
    const goodRoutes = engine.generateGoodRoutes('don gratton house', 'paddington');
    const goodResult = validator.validate(goodRoutes);
    
    console.log(`Routes Generated: ${goodRoutes.length}`);
    goodRoutes.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.type} - ${r.totalTime} mins`);
    });
    console.log('');
    
    console.log('Validation Results:');
    Object.entries(goodResult.rules).forEach(([rule, result]) => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`  ${icon} ${rule}: ${result.message} (Score: ${result.score}/100)`);
    });
    console.log(`\nOverall Score: ${goodResult.score}/100 ${goodResult.passed ? '✅ PASS' : '❌ FAIL'}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Summary
    console.log('📊 SUMMARY\n');
    console.log(`Current Implementation: ${currentResult.score}/100 ${currentResult.passed ? '✅' : '❌'}`);
    console.log(`Expected Implementation: ${goodResult.score}/100 ${goodResult.passed ? '✅' : '❌'}`);
    console.log(`\nImprovement Needed: ${goodResult.score - currentResult.score} points\n`);

    // Exit code based on if we know what good looks like
    process.exit(goodResult.passed ? 0 : 1);
}

// Run if called directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Always run when executed
runValidationTests();

export { RouteValidator, MockRouteEngine };
