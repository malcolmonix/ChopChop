# Cart Context Migration Fix

## Issue
The app was throwing `"useCart must be used within CartProvider"` error because pages were importing from the old `lib/cart.tsx` instead of the new `lib/context/cart.context.tsx`.

## Solution
Made the new `CartProvider` **backward compatible** with the old cart API.

## Changes Made

### 1. Enhanced Cart Context (`lib/context/cart.context.tsx`)
- **Dual API Support**: Supports both old and new API signatures
- **State Management**: Tracks `restaurantId`, `restaurantName`, and `items`
- **Single Restaurant Enforcement**: Clears cart when switching restaurants (like old behavior)
- **Backward Compatible Methods**:
  - `state` - Returns `{ restaurantId, restaurantName, items }`
  - `setQuantity()` - Alias for `updateQuantity()`
  - `clear()` - Alias for `clearCart()`
  - `count` - Alias for `itemCount`

### 2. Old API Support
```tsx
// Old API (still works)
const { state, count, setQuantity, clear, addItem } = useCart();
addItem(restaurantId, restaurantName, menuItem);

// New API (also works)
const { items, itemCount, updateQuantity, clearCart, addItem } = useCart();
addItem({ id, name, price, quantity, restaurantId });
```

### 3. Updated Imports
- `pages/_app.tsx` - Now uses new `CartProvider` only
- `pages/restaurant/[id].tsx` - Imports from `lib/context/cart.context`
- `pages/checkout.tsx` - Imports from `lib/context/cart.context`

## Benefits
✅ No breaking changes to existing pages
✅ All old code continues to work
✅ New features available (toast integration, better persistence)
✅ Single source of truth for cart state
✅ Cross-tab synchronization

## Testing
The app should now load without errors. The cart functionality on:
- Restaurant pages (adding items)
- Checkout page (viewing cart, updating quantities)

...will all continue to work as before.

## Next Steps
Once confirmed working, you can gradually migrate pages to use the new API:
```tsx
// Instead of this:
addItem(restaurantId, restaurantName, { id, title, price, quantity });

// Use this:
addItem({ 
  id, 
  name: title, 
  price, 
  quantity,
  restaurantId 
});
```

But it's not required - both APIs work!
