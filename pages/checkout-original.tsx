import React from 'react';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import { useCart } from '../lib/context/cart.context';
import { USER_CURRENT_LOCATION_LS_KEY } from '../components/CitySearch';

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orderId
      restaurantId
      orderStatus
      createdAt
      total
      items { id title quantity price }
    }
  }
`;

// Richer order mutation aligned with Enatega's signature (server implemented in sqlite-backend)
const PLACE_ORDER = gql`
  mutation PlaceOrder(
    $restaurant: String!
    $orderInput: [OrderInput!]!
    $paymentMethod: String!
    $couponCode: String
    $tipping: Float!
    $taxationAmount: Float!
    $address: AddressInput!
    $orderDate: String!
    $isPickedUp: Boolean!
    $deliveryCharges: Float!
    $instructions: String
  ) {
    placeOrder(
      restaurant: $restaurant
      orderInput: $orderInput
      paymentMethod: $paymentMethod
      couponCode: $couponCode
      tipping: $tipping
      taxationAmount: $taxationAmount
      address: $address
      orderDate: $orderDate
      isPickedUp: $isPickedUp
      deliveryCharges: $deliveryCharges
      instructions: $instructions
    ) {
      orderId
      orderStatus
      paidAmount
      orderAmount
      deliveryCharges
      tipping
      taxationAmount
      createdAt
    }
  }
`;

export default function CheckoutPage() {
  const { state, total, count, setQuantity, removeItem, clear } = useCart();
  const [placing, setPlacing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [orderCode, setOrderCode] = React.useState<string | null>(null);

  const placeOrder = async () => {
    if (!state.restaurantId || state.items.length === 0) return;
    setPlacing(true);
    setError(null);
    try {
      // Build variables for PlaceOrder
      const local = (() => {
        try { return JSON.parse(localStorage.getItem(USER_CURRENT_LOCATION_LS_KEY) || 'null'); } catch { return null; }
      })();
      const deliveryAddress: string = local?.deliveryAddress || local?.label || '';
      const coords: [number, number] | undefined = local?.location?.coordinates;
      const latitude = coords && coords.length === 2 ? coords[1] : undefined;
      const longitude = coords && coords.length === 2 ? coords[0] : undefined;

      const variables = {
        restaurant: String(state.restaurantId),
        orderInput: state.items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
        paymentMethod: 'CASH',
        couponCode: null as string | null,
        tipping: 0,
        taxationAmount: 0,
        address: { deliveryAddress: deliveryAddress || 'Pickup', latitude, longitude },
        orderDate: new Date().toISOString(),
        isPickedUp: deliveryAddress ? false : true,
        deliveryCharges: 0,
        instructions: null as string | null,
      };

      let code: string | null = null;
      try {
        const res = await client.mutate<any>({ mutation: PLACE_ORDER, variables });
        code = (res.data as any)?.placeOrder?.orderId || null;
      } catch (err: any) {
        // Fallback to simple createOrder if placeOrder isn't supported
        const msg = err?.message || '';
        const errors: Array<{ message?: string }> = err?.graphQLErrors || err?.networkError?.result?.errors || [];
        const statusCode: number | undefined = err?.networkError?.statusCode || err?.statusCode;
        const joined = [msg, ...errors.map(e => e?.message || '')].join(' \n ');
        const unsupported = /Cannot query field\s+"placeOrder"|Unknown argument|Unknown type\s+"OrderInput"/i.test(joined) || Number(statusCode) === 400;
        if (!unsupported) throw err;

        const input = {
          restaurantId: state.restaurantId,
          items: state.items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
          deliveryAddress: deliveryAddress || undefined,
          deliveryLatitude: latitude,
          deliveryLongitude: longitude,
        };
        const res2 = await client.mutate<any>({ mutation: CREATE_ORDER, variables: { input } });
        code = (res2.data as any)?.createOrder?.orderId || null;
      }

      setOrderCode(code);
      clear();
    } catch (e: any) {
      setError(e?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (orderCode) {
    return (
      <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 16px' }}>
        <h1>Order placed</h1>
        <p>Your order number is <strong>{orderCode}</strong>.</p>
        <a href="/" style={{ color: '#0ea5e9' }}>Continue browsing</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 16px' }}>
      <h1>Checkout</h1>
      {count === 0 ? (
        <div>Your cart is empty. <a href="/" style={{ color: '#0ea5e9' }}>Go back</a></div>
      ) : (
        <>
          <div style={{ margin: '12px 0', color: '#6b7280' }}>Restaurant: {state.restaurantName || state.restaurantId}</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {state.items.map((i) => (
              <li key={i.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ flex: '1 1 auto' }}>
                  <div style={{ fontWeight: 600 }}>{i.title}</div>
                  <div style={{ color: '#6b7280' }}>₦{i.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setQuantity(i.id, i.quantity - 1)} aria-label="decrement">−</button>
                  <div>{i.quantity}</div>
                  <button onClick={() => setQuantity(i.id, i.quantity + 1)} aria-label="increment">+</button>
                </div>
                <button onClick={() => removeItem(i.id)} style={{ color: '#ef4444' }}>Remove</button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
            <div>Total</div>
            <div style={{ fontWeight: 700 }}>₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>

          {error ? <div style={{ color: '#ef4444', marginTop: 12 }}>{error}</div> : null}

          <button
            onClick={placeOrder}
            disabled={placing}
            style={{ marginTop: 16, background: '#22c55e', color: '#fff', padding: '12px 16px', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {placing ? 'Placing…' : 'Place Order'}
          </button>
        </>
      )}
    </div>
  );
}
