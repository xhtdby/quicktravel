#!/usr/bin/env python3
"""
QuickTravel Automated Test Runner - Python Edition
Runs headless browser tests using Selenium
"""

import json
import time
import subprocess
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

class TestRunner:
    def __init__(self):
        self.driver = None
        self.results = []
        
    def setup(self):
        """Initialize headless Chrome"""
        print("🚀 Starting Automated Test Runner\n")
        
        chrome_options = Options()
        chrome_options.add_argument('--headless=new')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            print("✓ Browser initialized\n")
        except Exception as e:
            print(f"❌ Failed to initialize browser: {e}")
            print("💡 Make sure Chrome/Chromium and chromedriver are installed")
            sys.exit(1)
    
    def check_server(self):
        """Check if local server is running"""
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 8000))
        sock.close()
        return result == 0
    
    def run_tests(self):
        """Execute the test suite"""
        try:
            print("⚙️  Loading test page...\n")
            self.driver.get('http://localhost:8000/test-routes-auto.html')
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "runTests"))
            )
            
            print("✓ Test page loaded\n")
            print("=" * 60)
            print()
            
            # Click run tests button
            run_button = self.driver.find_element(By.ID, "runTests")
            run_button.click()
            
            # Wait for tests to complete (button re-enabled)
            WebDriverWait(self.driver, 120).until(
                lambda driver: driver.find_element(By.ID, "runTests").is_enabled()
            )
            
            # Extract results
            test_cases = self.driver.find_elements(By.CLASS_NAME, "test-case")
            
            for idx, test_case in enumerate(test_cases):
                name = test_case.find_element(By.CLASS_NAME, "test-name").text
                status = test_case.find_element(By.CLASS_NAME, "test-status").text
                passed = "PASSED" in status
                
                # Extract score
                score = 0
                if "(" in status and "/100)" in status:
                    score = int(status.split("(")[1].split("/")[0])
                
                # Extract issues
                issues = []
                issue_elements = test_case.find_elements(By.CLASS_NAME, "issue")
                for issue in issue_elements:
                    severity = "CRITICAL" if "critical" in issue.get_attribute("class") else "WARNING"
                    issues.append({
                        'severity': severity,
                        'text': issue.text.strip()
                    })
                
                # Extract routes
                routes = []
                route_elements = test_case.find_elements(By.CLASS_NAME, "route-item")
                for route in route_elements:
                    routes.append(route.text.strip())
                
                result = {
                    'name': name,
                    'passed': passed,
                    'score': score,
                    'status': status,
                    'issues': issues,
                    'routes': routes
                }
                
                self.results.append(result)
            
            # Get summary
            summary = {
                'total': int(self.driver.find_element(By.ID, "totalTests").text),
                'passed': int(self.driver.find_element(By.ID, "passedTests").text),
                'failed': int(self.driver.find_element(By.ID, "failedTests").text),
                'avgScore': int(self.driver.find_element(By.ID, "avgScore").text)
            }
            
            self.display_results(summary)
            return summary
            
        except Exception as e:
            print(f"❌ Error running tests: {e}")
            raise
    
    def display_results(self, summary):
        """Display test results"""
        print()
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print()
        
        print(f"  Total Tests:   {summary['total']}")
        print(f"  Passed:        {summary['passed']} ✅")
        print(f"  Failed:        {summary['failed']} ❌")
        print(f"  Average Score: {summary['avgScore']}/100")
        
        pass_rate = (summary['passed'] / summary['total'] * 100) if summary['total'] > 0 else 0
        print(f"  Pass Rate:     {pass_rate:.1f}%")
        print()
        
        print("=" * 60)
        print()
        
        # Display individual results
        for idx, result in enumerate(self.results):
            icon = "✅" if result['passed'] else "❌"
            print(f"{icon} Test {idx + 1}: {result['name']}")
            print(f"   Status: {result['status']}")
            
            if result['routes']:
                print(f"   Routes Generated: {len(result['routes'])}")
                for route in result['routes']:
                    print(f"     • {route}")
            
            if result['issues']:
                print(f"   Issues Found:")
                for issue in result['issues']:
                    severity_icon = "🚨" if issue['severity'] == 'CRITICAL' else "⚠️"
                    print(f"     {severity_icon} {issue['text']}")
            
            print()
        
        print("=" * 60)
        print()
        
        # Final verdict
        if summary['passed'] == summary['total']:
            print("✨ ALL TESTS PASSED! ✨\n")
        else:
            print(f"⚠️  {summary['failed']} TEST(S) FAILED")
            print("Review the issues above to fix the RouteEngine.\n")
    
    def cleanup(self):
        """Close browser"""
        if self.driver:
            self.driver.quit()
            print("✓ Browser closed")
    
    def run(self):
        """Main execution"""
        try:
            self.setup()
            
            # Check server
            if not self.check_server():
                print("❌ Server is not running on port 8000!")
                print("💡 Start server first: python -m http.server 8000")
                sys.exit(1)
            
            print("✓ Server is running\n")
            
            summary = self.run_tests()
            
            # Exit code
            exit_code = 0 if summary['passed'] == summary['total'] else 1
            
            self.cleanup()
            sys.exit(exit_code)
            
        except Exception as e:
            print(f"❌ Fatal error: {e}")
            self.cleanup()
            sys.exit(1)

if __name__ == "__main__":
    print("╔════════════════════════════════════════════════════╗")
    print("║  QuickTravel Automated Test Suite (Python)        ║")
    print("╚════════════════════════════════════════════════════╝")
    print()
    
    runner = TestRunner()
    runner.run()
