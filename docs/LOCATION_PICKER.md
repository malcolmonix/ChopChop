# 📍 Location Picker Integration

A user-friendly location picker with accurate address resolution for the ChopChop food delivery app.

## ✨ Features

### 🔍 **Smart Address Search**
- **Autocomplete suggestions** as you type
- **Real-time results** with debounced search
- **Location-aware** - prioritizes nearby places
- **Fallback service** - works without Google API key

### 📱 **GPS Integration**
- **One-tap location** - get current position
- **Automatic address lookup** from coordinates
- **Accurate positioning** with high precision
- **Permission handling** with user-friendly messages

### 🎯 **Precise Address Selection**
- **Detailed address components** (street, city, state)
- **GPS coordinates** for accurate delivery
- **Address validation** for Nigerian locations
- **Formatted addresses** ready for delivery

### 🛡️ **Robust & Reliable**
- **Multiple geocoding services** - Google + OpenStreetMap fallback
- **Error handling** with graceful degradation  
- **Rate limiting** respect for free APIs
- **Offline support** with cached results

## 🚀 Quick Start

### 1. **Basic Usage**
```tsx
import { AddressPicker } from '../lib/components/address-picker';

function MyComponent() {
  const [showPicker, setShowPicker] = useState(false);
  
  const handleAddressSelect = (address) => {
    console.log('Selected:', address);
    // Use the address in your app
  };

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Select Address
      </button>
      
      {showPicker && (
        <AddressPicker
          onAddressSelect={handleAddressSelect}
          onClose={() => setShowPicker(false)}
          currentAddress={existingAddress} // optional
        />
      )}
    </>
  );
}
```

### 2. **Using Location Hooks**
```tsx
import { useLocationSearch, useCurrentLocation } from '../lib/hooks/useLocationSearch';

function AddressForm() {
  const { query, setQuery, results, isLoading } = useLocationSearch();
  const { getCurrentLocation, location, isLoading: gpsLoading } = useCurrentLocation();

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for address..."
      />
      
      {isLoading && <div>Searching...</div>}
      
      {results.map(result => (
        <div key={result.placeId}>
          {result.description}
        </div>
      ))}
      
      <button onClick={getCurrentLocation} disabled={gpsLoading}>
        {gpsLoading ? 'Getting location...' : 'Use GPS'}
      </button>
    </div>
  );
}
```

## ⚙️ Configuration

### Environment Variables
Create `.env.local` file:
```bash
# Optional: Google Maps API Key for enhanced accuracy
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Fallback: Uses free OpenStreetMap service
NEXT_PUBLIC_USE_FALLBACK_GEOCODING=true
```

### Google Maps Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new API key
3. Enable these APIs:
   - **Places API** - for address autocomplete
   - **Geocoding API** - for coordinate conversion
   - **Maps JavaScript API** - for map display
4. Add API key to environment variables

> **Note:** The app works perfectly without Google API key using OpenStreetMap services!

## 🎨 User Experience

### **Simple 3-Step Process:**

1. **🔍 Search** - Type address or landmark
   - Get instant suggestions
   - See detailed location info
   - Pick from dropdown

2. **📍 GPS** - Or use current location
   - One-tap positioning
   - Automatic address lookup
   - High accuracy location

3. **✅ Confirm** - Review and save
   - See full address details
   - Add delivery instructions
   - Save to profile

### **Visual Feedback:**
- ✅ **Green checkmark** when location verified
- 🔄 **Loading spinner** during searches
- 📍 **GPS icon** for location services
- ⚠️ **Clear error messages** for issues

## 🏗️ Architecture

### Services
- **`LocationService`** - Core geocoding logic
- **Google Places API** - Premium address search
- **OpenStreetMap Nominatim** - Free fallback service

### Components
- **`AddressPicker`** - Main modal interface
- **Search input** with autocomplete
- **Results dropdown** with place details
- **GPS button** for current location

### Hooks
- **`useLocationSearch`** - Address autocomplete
- **`useCurrentLocation`** - GPS positioning
- **`useReverseGeocode`** - Coordinate → Address

## 🛠️ Technical Details

### **Geocoding Flow:**
1. **User Input** → Search query or GPS coordinates
2. **API Call** → Google Places or OpenStreetMap
3. **Parse Results** → Extract address components
4. **Validation** → Check Nigerian location bounds
5. **Format** → Create standardized address object

### **Data Structure:**
```typescript
interface LocationResult {
  placeId: string;
  formattedAddress: string;
  coordinates: { lat: number; lng: number };
  addressComponents: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}
```

### **Error Handling:**
- **Network issues** → Show retry option
- **Permission denied** → Fallback to manual entry
- **No results** → Suggest manual input
- **Invalid location** → Warn about delivery area

## 🎯 Nigerian Market Optimization

- **Country restriction** to Nigeria (`ng`)
- **Local landmarks** recognition
- **Popular cities** quick selection
- **State/LGA** address components
- **Delivery zones** validation ready

## 📱 Mobile Optimized

- **Touch-friendly** interface
- **Responsive design** for all screen sizes
- **Fast loading** with optimized requests
- **Gesture support** for map interactions
- **Offline capabilities** with service worker ready

## 🔒 Privacy & Security

- **Location permissions** properly requested
- **Data minimization** - only necessary info stored
- **HTTPS only** for all API calls
- **No tracking** of user searches
- **Clear privacy** indicators

## 🚀 Performance

- **Debounced search** (300ms delay)
- **Request caching** for repeated searches
- **Lazy loading** of map components
- **Optimized bundle** size
- **Rate limiting** respect

## 🔧 Troubleshooting

### Common Issues:

**"Location not found"**
- ✅ Check internet connection
- ✅ Try different search terms
- ✅ Use GPS location instead

**"Permission denied"**
- ✅ Enable location in browser settings
- ✅ Allow site location access
- ✅ Try manual address entry

**"Service unavailable"**
- ✅ App automatically falls back to alternative service
- ✅ Try again in a few moments
- ✅ Use manual address entry as backup

## 📈 Future Enhancements

- 🗺️ **Interactive map** display
- 🏪 **Delivery zone** visualization  
- 🚀 **Address history** and favorites
- 📱 **Offline maps** caching
- 🔔 **Location sharing** with delivery drivers

---

**Ready to deliver! 🚚** The location picker is now integrated and ready for accurate food delivery address selection.