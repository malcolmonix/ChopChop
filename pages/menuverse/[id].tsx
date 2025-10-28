import React from 'react';
import { useRouter } from 'next/router';
import { useEatery, useMenuItems, useOrderPlacement } from '../../lib/hooks/use-menuverse';
import { MenuItem, OrderItem } from '../../lib/services/menuverse';

// Shopping Cart Context (simple implementation)
interface CartItem extends OrderItem {
  menuItemId: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  getTotalAmount: () => number;
  clearCart: () => void;
}

const CartContext = React.createContext<CartContextType | null>(null);

const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<CartItem[]>([]);

  const addItem = (menuItem: MenuItem, quantity: number) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.menuItemId === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, {
          id: menuItem.id,
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity
        }];
      }
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    
    setItems(prev => prev.map(item =>
      item.menuItemId === menuItemId
        ? { ...item, quantity }
        : item
    ));
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      getTotalAmount,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Menu Item Card Component
interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = React.useState(1);

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">${item.price.toFixed(2)}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.category}
                </span>
              </div>
            </div>
            
            {item.imageUrl && (
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium text-gray-700">
                Qty:
              </label>
              <select
                id={`quantity-${item.id}`}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shopping Cart Sidebar
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  eateryId: string;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, eateryId }) => {
  const cart = useCart();
  const { placeOrder, loading: orderLoading, error: orderError, orderId } = useOrderPlacement();
  const [customer, setCustomer] = React.useState({
    name: '',
    email: '',
    address: ''
  });

  const handlePlaceOrder = async () => {
    if (!cart.items.length) return;
    
    try {
      const orderData = {
        eateryId,
        customer,
        items: cart.items,
        totalAmount: cart.getTotalAmount()
      };
      
      await placeOrder(eateryId, orderData);
      cart.clearCart();
      // Show success message or redirect
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {cart.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.menuItemId} className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => cart.updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Information */}
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Delivery Information</h3>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customer.name}
                  onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={customer.email}
                  onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="Delivery Address"
                  value={customer.address}
                  onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${cart.getTotalAmount().toFixed(2)}</span>
                </div>
              </div>

              {/* Order Success */}
              {orderId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 font-medium">Order placed successfully!</p>
                  <p className="text-green-600 text-sm">Order ID: {orderId}</p>
                </div>
              )}

              {/* Order Error */}
              {orderError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">{orderError}</p>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading || !customer.name || !customer.email || !customer.address}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {orderLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Main Restaurant Detail Page Component
const RestaurantDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const eateryId = Array.isArray(id) ? id[0] : id;

  const { eatery, loading: eateryLoading, error: eateryError } = useEatery(eateryId || null);
  const { menuItems, loading: menuLoading, error: menuError } = useMenuItems(eateryId || null);
  const [cartOpen, setCartOpen] = React.useState(false);
  const cart = useCart();

  // Group menu items by category
  const menuByCategory = React.useMemo(() => {
    const categories: Record<string, MenuItem[]> = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
  }, [menuItems]);

  const loading = eateryLoading || menuLoading;
  const error = eateryError || menuError;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !eatery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The restaurant you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Hero */}
      <div className="relative h-64 bg-gray-200">
        {eatery.bannerUrl && (
          <img
            src={eatery.bannerUrl}
            alt={eatery.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{eatery.name}</h1>
          <p className="text-white/90">{eatery.description}</p>
        </div>
      </div>

      {/* Fixed Cart Button */}
      {cart.items.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary-700 z-30 flex items-center space-x-2"
        >
          <span>Cart ({cart.items.length})</span>
          <span className="bg-white text-primary-600 px-2 py-1 rounded-full text-sm font-bold">
            ${cart.getTotalAmount().toFixed(2)}
          </span>
        </button>
      )}

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu</h2>
          
          {Object.keys(menuByCategory).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No menu items available</p>
          ) : (
            <div className="space-y-8">
              {Object.entries(menuByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    {category}
                  </h3>
                  <div className="grid gap-4">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={cart.addItem}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        eateryId={eateryId || ''}
      />
    </div>
  );
};

// Page wrapper with CartProvider
const RestaurantDetailPage: React.FC = () => {
  return (
    <CartProvider>
      <RestaurantDetail />
    </CartProvider>
  );
};

export default RestaurantDetailPage;