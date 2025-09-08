# Google Maps API Setup

## Getting Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict your API key to your app's bundle ID for security

## Adding the API Key to Your App

In `app/screen/map.tsx`, find this line:
```javascript
script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places';
```

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key.

## Features Included

- ✅ Interactive Google Maps via WebView (works in Expo Go)
- ✅ User location marker with custom icon
- ✅ Custom markers for stadiums and restaurants
- ✅ Search functionality with bottom sheet
- ✅ Distance calculations
- ✅ Place selection and map recentering
- ✅ Voice search button (ready for implementation)

## Dummy Data

The app includes sample places:
- Madison Square Garden (stadium)
- Joe's Pizza (restaurant)
- Barclays Center (stadium)
- Shake Shack (restaurant)

## Next Steps

1. Add your Google Maps API key
2. Implement Google Places API integration
3. Add voice search functionality
4. Connect to real event data
