import React from 'react';

export type CartItem = {
  id: string; // menu item id
  title: string;
  price: number;
  quantity: number;
};

export type CartState = {
  restaurantId?: string;
  restaurantName?: string;
  items: CartItem[];
};

const CART_LS_KEY = 'WEB_CART_V1';

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(CART_LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { items: [] };
}

function saveCart(state: CartState) {
  try { localStorage.setItem(CART_LS_KEY, JSON.stringify(state)); } catch {}
}

export type CartContextType = {
  state: CartState;
  addItem: (restaurantId: string, restaurantName: string, item: CartItem) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CartState>({ items: [] });

  React.useEffect(() => {
    setState(loadCart());
  }, []);

  React.useEffect(() => {
    saveCart(state);
  }, [state]);

  const addItem = React.useCallback((restaurantId: string, restaurantName: string, item: CartItem) => {
    setState((prev) => {
      // enforce single-restaurant cart
      let base: CartState = prev;
      if (prev.restaurantId && prev.restaurantId !== restaurantId) {
        base = { restaurantId, restaurantName, items: [] };
      }
      if (!base.restaurantId) base = { ...base, restaurantId, restaurantName };

      const existing = base.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          ...base,
          items: base.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)),
        };
      }
      return { ...base, items: [...base.items, item] };
    });
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
  }, []);

  const setQuantity = React.useCallback((id: string, qty: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, qty) } : i)).filter((i) => i.quantity > 0),
    }));
  }, []);

  const clear = React.useCallback(() => setState({ items: [] }), []);

  const total = React.useMemo(() => state.items.reduce((s, i) => s + i.price * i.quantity, 0), [state.items]);
  const count = React.useMemo(() => state.items.reduce((s, i) => s + i.quantity, 0), [state.items]);

  const value: CartContextType = { state, addItem, removeItem, setQuantity, clear, total, count };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
