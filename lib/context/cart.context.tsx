"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// New interface
interface CartItem {
  id: string;
  restaurantId?: string;
  name?: string;
  title?: string; // Backward compatibility
  price: number;
  quantity: number;
  image?: string;
  variations?: any[];
  addons?: any[];
}

// Backward compatible state type
interface CartState {
  restaurantId?: string;
  restaurantName?: string;
  items: CartItem[];
}

interface CartContextType {
  // New API
  items: CartItem[];
  addItem: (item: CartItem | any, restaurantName?: string, menuItem?: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  
  // Backward compatible API
  state: CartState;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'enatega_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>();
  const [restaurantName, setRestaurantName] = useState<string>();
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed.items) {
          setItems(parsed.items);
          setRestaurantId(parsed.restaurantId);
          setRestaurantName(parsed.restaurantName);
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ 
          items, 
          restaurantId, 
          restaurantName 
        }));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [items, restaurantId, restaurantName, isHydrated]);

  // Support both old and new API signatures
  const addItem = useCallback((
    itemOrRestaurantId: CartItem | string, 
    restaurantNameOrUndefined?: string, 
    menuItem?: CartItem
  ) => {
    // Old API: addItem(restaurantId, restaurantName, item)
    if (typeof itemOrRestaurantId === 'string' && menuItem) {
      const newRestaurantId = itemOrRestaurantId;
      const newRestaurantName = restaurantNameOrUndefined || '';
      
      setItems(prev => {
        // Enforce single-restaurant cart
        if (restaurantId && restaurantId !== newRestaurantId) {
          setRestaurantId(newRestaurantId);
          setRestaurantName(newRestaurantName);
          return [menuItem];
        }
        
        if (!restaurantId) {
          setRestaurantId(newRestaurantId);
          setRestaurantName(newRestaurantName);
        }
        
        const existingItem = prev.find(i => i.id === menuItem.id);
        if (existingItem) {
          return prev.map(i =>
            i.id === menuItem.id ? { ...i, quantity: i.quantity + menuItem.quantity } : i
          );
        }
        return [...prev, menuItem];
      });
    } else {
      // New API: addItem(item)
      const item = itemOrRestaurantId as CartItem;
      console.log('🛒 Cart: Adding item via new API:', item);
      
      setItems(prev => {
        const existingItem = prev.find(i => i.id === item.id);
        if (existingItem) {
          console.log('🛒 Cart: Item exists, updating quantity');
          return prev.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        }
        console.log('🛒 Cart: New item, adding to cart');
        return [...prev, item];
      });
      
      if (item.restaurantId && !restaurantId) {
        console.log('🛒 Cart: Setting restaurant ID:', item.restaurantId);
        setRestaurantId(item.restaurantId);
      }
    }
  }, [restaurantId]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurantId(undefined);
    setRestaurantName(undefined);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Backward compatible state
  const state: CartState = {
    restaurantId,
    restaurantName,
    items,
  };

  return (
    <CartContext.Provider
      value={{
        // New API
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        // Backward compatible API
        state,
        setQuantity: updateQuantity,
        clear: clearCart,
        count: itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
