# MenuVerse Integration

This document describes the MenuVerse API integration implemented in the multivendor-web application.

## Overview

MenuVerse is our vendor application that manages restaurant profiles, menus, and orders through Firebase Firestore. This integration allows the consumer web app to fetch real restaurant data instead of using mock data.

## Architecture

```
Consumer Web App (multivendor-web)
    ↓
MenuVerse Firebase Client
    ↓
MenuVerse Firestore Database
    ↓
Restaurant Data, Menus, Orders
```

## Implementation

### 1. Firebase Configuration
- **File**: `lib/firebase/menuverse.ts`
- **Purpose**: Separate Firebase app instance for MenuVerse
- **Features**: Anonymous authentication, error handling

### 2. Data Services
- **File**: `lib/services/menuverse.ts`
- **Purpose**: Service layer for all MenuVerse operations
- **Methods**:
  - `getAllEateries()` - Fetch all restaurants
  - `getEateryProfile(id)` - Fetch single restaurant
  - `getMenuItems(eateryId)` - Fetch restaurant menu
  - `placeOrder(eateryId, orderData)` - Place customer order
  - `searchEateries(term)` - Search restaurants

### 3. React Hooks
- **File**: `lib/hooks/use-menuverse.ts`
- **Purpose**: React hooks for easy data fetching
- **Hooks**:
  - `useEateries()` - Fetch all restaurants
  - `useEatery(id)` - Fetch single restaurant
  - `useMenuItems(id)` - Fetch menu items
  - `useEaterySearch()` - Search functionality
  - `useOrderPlacement()` - Order placement

### 4. Demo Pages
- **File**: `pages/menuverse-demo.tsx` - Restaurant listing with search
- **File**: `pages/menuverse/[id].tsx` - Restaurant detail with menu and cart

## Configuration

Add these environment variables to `.env.local`:

```env
# MenuVerse Firebase Config
NEXT_PUBLIC_MENUVERSE_API_KEY=your_api_key
NEXT_PUBLIC_MENUVERSE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_MENUVERSE_PROJECT_ID=your_project_id
NEXT_PUBLIC_MENUVERSE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_MENUVERSE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_MENUVERSE_APP_ID=1:123456789:web:abcdef
```

## Usage

### Fetch Restaurants
```tsx
import { useEateries } from '../lib/hooks/use-menuverse';

function RestaurantList() {
  const { eateries, loading, error } = useEateries();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {eateries.map(eatery => (
        <div key={eatery.id}>{eatery.name}</div>
      ))}
    </div>
  );
}
```

### Place Order
```tsx
import { useOrderPlacement } from '../lib/hooks/use-menuverse';

function OrderButton() {
  const { placeOrder, loading, orderId } = useOrderPlacement();
  
  const handleOrder = async () => {
    const orderData = {
      eateryId: 'restaurant-id',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St'
      },
      items: [
        { id: 'item-1', name: 'Burger', quantity: 1, price: 12.99 }
      ],
      totalAmount: 12.99
    };
    
    await placeOrder('restaurant-id', orderData);
  };
  
  return (
    <button onClick={handleOrder} disabled={loading}>
      {loading ? 'Placing Order...' : 'Place Order'}
    </button>
  );
}
```

## Data Models

### Eatery
```typescript
interface Eatery {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  contactEmail: string;
}
```

### MenuItem
```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
  imageUrl: string;
  eateryId: string;
}
```

### Order
```typescript
interface Order {
  eateryId: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status?: string;
  createdAt?: any;
}
```

## Testing

1. **Demo Page**: Visit `/menuverse-demo` to see restaurant listing
2. **Restaurant Detail**: Click any restaurant to see menu and cart
3. **Order Placement**: Add items to cart and place test orders

## Error Handling

- **Connection Issues**: Graceful fallback with error messages
- **Invalid Credentials**: Clear warnings about environment setup
- **Network Errors**: Retry mechanisms and user feedback
- **Data Validation**: Type-safe interfaces and runtime checks

## Next Steps

1. Replace main home page with MenuVerse data
2. Integrate with existing auth system
3. Add offline support with caching
4. Implement real-time order updates
5. Add payment processing integration

## Development Notes

- Uses Firebase v9+ modular SDK
- Implements singleton pattern for service instance
- Supports both authenticated and anonymous users
- Includes TypeScript interfaces for type safety
- Follows React hooks pattern for data fetching