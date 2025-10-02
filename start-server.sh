#!/bin/bash
# QuickTravel - Start Development Server

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     QuickTravel - Starting Development Server         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Server will start on: http://localhost:8000"
echo ""
echo "📋 Test Cases to Try:"
echo "   1. Don Gratton House → Paddington"
echo "   2. Whitechapel → Oxford Circus"
echo "   3. Liverpool Street → Bank"
echo ""
echo "✅ Expected Results:"
echo "   - 3-4 diverse routes per search"
echo "   - Hybrid Bike + Rail options"
echo "   - Multi-provider bike routes"
echo "   - NO legacy marketing labels labels"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

python3 -m http.server 8000 2>/dev/null || python -m http.server 8000

