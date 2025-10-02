@echo off
REM QuickTravel Test Runner - Windows Batch Script
echo.
echo ========================================================
echo   QuickTravel Automated Tests
echo ========================================================
echo.

REM Run validation tests
echo [1/1] Running validation tests...
echo.
node validate-routes.js

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   ALL TESTS PASSED!
    echo ========================================================
    exit /b 0
) else (
    echo.
    echo ========================================================
    echo   TESTS FAILED - Review output above
    echo ========================================================
    exit /b 1
)
