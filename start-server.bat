@echo off
REM QuickTravel - Start Development Server

echo.
echo ============================================================
echo      QuickTravel - Starting Development Server
echo ============================================================
echo.
echo Server will start on: http://localhost:8000
echo.
echo Test Cases to Try:
echo    1. Don Gratton House to Paddington
echo    2. Whitechapel to Oxford Circus
echo    3. Liverpool Street to Bank
echo.
echo Expected Results:
echo    - 3-4 diverse routes per search
echo    - Hybrid Bike + Rail options
echo    - Multi-provider bike routes
echo    - NO legacy marketing labels labels
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================================
echo.

python -m http.server 8000

