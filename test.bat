@echo off
REM QuickTravel Test Runner
echo.
echo ========================================================
echo   QuickTravel Engine Tests
echo ========================================================
echo.

node tests\run.js

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
