#!/bin/bash
# TypeScript check script with correct flags for React Native/Expo

echo "🔍 Checking TypeScript compilation..."
echo ""

# Check CreateEventForm component
echo "📱 Checking CreateEventForm.tsx..."
npx tsc --noEmit --skipLibCheck --jsx react-native --esModuleInterop app/components/CreateEventForm.tsx
if [ $? -eq 0 ]; then
    echo "✅ CreateEventForm.tsx - No errors"
else
    echo "❌ CreateEventForm.tsx - Has errors"
fi

echo ""

# Check CreateEvent screen
echo "📱 Checking CreateEvent.tsx..."
npx tsc --noEmit --skipLibCheck --jsx react-native --esModuleInterop app/screen/CreateEvent.tsx
if [ $? -eq 0 ]; then
    echo "✅ CreateEvent.tsx - No errors"
else
    echo "❌ CreateEvent.tsx - Has errors"
fi

echo ""
echo "🎉 TypeScript check complete!"
