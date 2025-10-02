// Automated Route Testing - Runs in Node.js with Puppeteer
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

class AutomatedTestRunner {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = [];
    }

    async initialize() {
        console.log(`${colors.cyan}${colors.bold}🚀 Starting Automated Test Runner${colors.reset}\n`);
        
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // Listen to console messages from the page
        this.page.on('console', msg => {
            const text = msg.text();
            if (text.includes('RouteEngine') || text.includes('validation')) {
                console.log(`  ${colors.blue}[Browser]${colors.reset} ${text}`);
            }
        });

        console.log(`${colors.green}✓ Browser initialized${colors.reset}`);
    }

    async runTests() {
        try {
            // Start local server first
            console.log(`${colors.yellow}⚙️  Starting local server on port 8000...${colors.reset}`);
            const serverUrl = 'http://localhost:8000';
            
            // Load the test page
            console.log(`${colors.yellow}📄 Loading test page...${colors.reset}\n`);
            await this.page.goto(`${serverUrl}/test-routes-auto.html`, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Wait for test framework to load
            await this.page.waitForFunction(() => {
                return typeof RouteValidator !== 'undefined';
            }, { timeout: 5000 });

            console.log(`${colors.green}✓ Test page loaded${colors.reset}\n`);
            console.log(`${colors.cyan}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

            // Run tests by clicking the button
            await this.page.click('#runTests');

            // Wait for tests to complete (max 2 minutes)
            await this.page.waitForFunction(() => {
                const button = document.getElementById('runTests');
                return button && !button.disabled;
            }, { timeout: 120000 });

            // Extract test results
            this.results = await this.page.evaluate(() => {
                const testCases = Array.from(document.querySelectorAll('.test-case'));
                return testCases.map((testCase, idx) => {
                    const name = testCase.querySelector('.test-name').textContent;
                    const statusEl = testCase.querySelector('.test-status');
                    const status = statusEl.textContent;
                    const passed = statusEl.classList.contains('passed');
                    
                    // Extract score from status text
                    const scoreMatch = status.match(/\((\d+)\/100\)/);
                    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
                    
                    // Extract issues
                    const issueElements = testCase.querySelectorAll('.issue');
                    const issues = Array.from(issueElements).map(issue => ({
                        severity: issue.classList.contains('critical') ? 'CRITICAL' : 'WARNING',
                        text: issue.textContent.trim()
                    }));
                    
                    // Extract routes
                    const routeElements = testCase.querySelectorAll('.route-item');
                    const routes = Array.from(routeElements).map(route => route.textContent.trim());
                    
                    return { name, passed, score, status, issues, routes };
                });
            });

            // Get summary
            const summary = await this.page.evaluate(() => {
                return {
                    total: parseInt(document.getElementById('totalTests').textContent),
                    passed: parseInt(document.getElementById('passedTests').textContent),
                    failed: parseInt(document.getElementById('failedTests').textContent),
                    avgScore: parseInt(document.getElementById('avgScore').textContent)
                };
            });

            this.displayResults(summary);
            
            return summary;

        } catch (error) {
            console.error(`${colors.red}❌ Error running tests:${colors.reset}`, error.message);
            throw error;
        }
    }

    displayResults(summary) {
        console.log(`${colors.cyan}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.cyan}${colors.bold}📊 TEST SUMMARY${colors.reset}`);
        console.log(`${colors.cyan}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
        
        console.log(`  Total Tests:  ${colors.bold}${summary.total}${colors.reset}`);
        console.log(`  Passed:       ${colors.green}${colors.bold}${summary.passed}${colors.reset}`);
        console.log(`  Failed:       ${colors.red}${colors.bold}${summary.failed}${colors.reset}`);
        console.log(`  Average Score: ${this.getScoreColor(summary.avgScore)}${summary.avgScore}/100${colors.reset}\n`);

        const passRate = (summary.passed / summary.total * 100).toFixed(1);
        console.log(`  Pass Rate:    ${this.getScoreColor(parseInt(passRate))}${passRate}%${colors.reset}\n`);

        console.log(`${colors.cyan}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        // Display individual test results
        this.results.forEach((result, idx) => {
            const icon = result.passed ? '✅' : '❌';
            const color = result.passed ? colors.green : colors.red;
            
            console.log(`${color}${icon} Test ${idx + 1}: ${result.name}${colors.reset}`);
            console.log(`   Status: ${color}${result.status}${colors.reset}`);
            
            if (result.routes.length > 0) {
                console.log(`   Routes Generated: ${result.routes.length}`);
                result.routes.forEach(route => {
                    console.log(`     • ${route}`);
                });
            }
            
            if (result.issues.length > 0) {
                console.log(`   Issues Found:`);
                result.issues.forEach(issue => {
                    const issueColor = issue.severity === 'CRITICAL' ? colors.red : colors.yellow;
                    console.log(`     ${issueColor}${issue.severity}: ${issue.text}${colors.reset}`);
                });
            }
            console.log('');
        });

        console.log(`${colors.cyan}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        // Final verdict
        if (summary.passed === summary.total) {
            console.log(`${colors.green}${colors.bold}✨ ALL TESTS PASSED! ✨${colors.reset}\n`);
        } else {
            console.log(`${colors.red}${colors.bold}⚠️  ${summary.failed} TEST(S) FAILED${colors.reset}`);
            console.log(`${colors.yellow}Review the issues above to fix the RouteEngine.${colors.reset}\n`);
        }
    }

    getScoreColor(score) {
        if (score >= 80) return colors.green + colors.bold;
        if (score >= 60) return colors.yellow + colors.bold;
        return colors.red + colors.bold;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log(`${colors.green}✓ Browser closed${colors.reset}`);
        }
    }

    async run() {
        try {
            await this.initialize();
            const summary = await this.runTests();
            
            // Exit with appropriate code
            const exitCode = summary.passed === summary.total ? 0 : 1;
            
            await this.cleanup();
            process.exit(exitCode);
            
        } catch (error) {
            console.error(`${colors.red}${colors.bold}Fatal error:${colors.reset}`, error);
            await this.cleanup();
            process.exit(1);
        }
    }
}

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch('http://localhost:8000');
        return response.ok;
    } catch {
        return false;
    }
}

// Main execution
(async () => {
    console.log(`${colors.cyan}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║  ${colors.bold}QuickTravel Automated Test Suite${colors.reset}${colors.cyan}              ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

    // Check if server is running
    console.log(`${colors.yellow}Checking if server is running on port 8000...${colors.reset}`);
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log(`${colors.red}❌ Server is not running!${colors.reset}`);
        console.log(`${colors.yellow}Please start the server first with: python -m http.server 8000${colors.reset}\n`);
        process.exit(1);
    }
    
    console.log(`${colors.green}✓ Server is running${colors.reset}\n`);

    const runner = new AutomatedTestRunner();
    await runner.run();
})();
