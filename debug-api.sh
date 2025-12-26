#!/bin/bash
# Debug script for GolfMaps API endpoints
# Run this on your EC2 instance to test API routes

echo "🔍 GolfMaps API Debug Script"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Next.js is running
echo "1. Checking if Next.js is running on port 3000..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓${NC} Next.js is running"
else
    echo -e "${RED}✗${NC} Next.js is not responding on port 3000"
    echo "   Run: pm2 start ecosystem.config.js"
    exit 1
fi

echo ""

# Test health endpoint
echo "2. Testing /api/health endpoint..."
HEALTH=$(curl -s http://localhost:3000/api/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Health endpoint responded"
    echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
    echo -e "${RED}✗${NC} Health endpoint failed"
fi

echo ""

# Test courses endpoint
echo "3. Testing /api/courses endpoint..."
COURSES=$(curl -s http://localhost:3000/api/courses)
if [ $? -eq 0 ]; then
    COURSE_COUNT=$(echo "$COURSES" | jq '. | length' 2>/dev/null || echo "unknown")
    if [ "$COURSE_COUNT" != "0" ] && [ "$COURSE_COUNT" != "null" ] && [ "$COURSE_COUNT" != "" ]; then
        echo -e "${GREEN}✓${NC} Courses endpoint returned $COURSE_COUNT courses"
        FIRST_COURSE_ID=$(echo "$COURSES" | jq -r '.[0].id' 2>/dev/null)
        if [ "$FIRST_COURSE_ID" != "null" ] && [ "$FIRST_COURSE_ID" != "" ]; then
            echo "   First course ID: $FIRST_COURSE_ID"
            
            # Test weather endpoint
            echo ""
            echo "4. Testing /api/weather endpoint..."
            WEATHER=$(curl -s "http://localhost:3000/api/weather?courseId=$FIRST_COURSE_ID")
            if echo "$WEATHER" | jq -e '.temperature' > /dev/null 2>&1; then
                echo -e "${GREEN}✓${NC} Weather endpoint working"
                TEMP=$(echo "$WEATHER" | jq -r '.temperature' 2>/dev/null)
                echo "   Temperature: ${TEMP}°F"
            else
                echo -e "${RED}✗${NC} Weather endpoint failed"
                echo "$WEATHER" | jq '.' 2>/dev/null || echo "$WEATHER"
            fi
            
            # Test busyness endpoint
            echo ""
            echo "5. Testing /api/busyness endpoint..."
            BUSYNESS=$(curl -s "http://localhost:3000/api/busyness?courseId=$FIRST_COURSE_ID")
            if echo "$BUSYNESS" | jq -e '.score' > /dev/null 2>&1; then
                echo -e "${GREEN}✓${NC} Busyness endpoint working"
                SCORE=$(echo "$BUSYNESS" | jq -r '.score' 2>/dev/null)
                LABEL=$(echo "$BUSYNESS" | jq -r '.label' 2>/dev/null)
                echo "   Busyness: $LABEL ($SCORE)"
            else
                echo -e "${RED}✗${NC} Busyness endpoint failed"
                echo "$BUSYNESS" | jq '.' 2>/dev/null || echo "$BUSYNESS"
            fi
        fi
    else
        echo -e "${YELLOW}⚠${NC} Courses endpoint returned empty or error"
        echo "$COURSES" | jq '.' 2>/dev/null || echo "$COURSES"
    fi
else
    echo -e "${RED}✗${NC} Courses endpoint failed"
fi

echo ""
echo "============================"
echo "Debug complete!"
echo ""
echo "To view PM2 logs: pm2 logs golfmaps"
echo "To view Nginx logs: sudo tail -f /var/log/nginx/golfmaps-error.log"

