const { ApolloClient, InMemoryCache, createHttpLink, gql } = require('@apollo/client');
const fetch = require('cross-fetch');

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  fetch: fetch,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

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

async function testOrderFlow() {
  console.log('🧪 Testing Order Flow...\n');

  // Test Cash on Delivery Order
  console.log('1. Testing Cash on Delivery Order...');
  try {
    const cashOrderResult = await client.mutate({
      mutation: PLACE_ORDER,
      variables: {
        restaurant: "1",
        orderInput: [
          {
            title: "Jollof Rice",
            quantity: 2,
            price: 1500
          },
          {
            title: "Fried Chicken",
            quantity: 1,
            price: 2000
          }
        ],
        paymentMethod: "CASH",
        couponCode: null,
        tipping: 200,
        taxationAmount: 375,
        address: {
          deliveryAddress: "123 Test Street, Lagos",
          latitude: 6.5244,
          longitude: 3.3792
        },
        orderDate: new Date().toISOString(),
        isPickedUp: false,
        deliveryCharges: 500,
        instructions: "Test cash order - call when you arrive"
      }
    });

    console.log('✅ Cash Order Success:');
    console.log(`   Order ID: ${cashOrderResult.data.placeOrder.orderId}`);
    console.log(`   Status: ${cashOrderResult.data.placeOrder.orderStatus}`);
    console.log(`   Paid Amount: ₦${cashOrderResult.data.placeOrder.paidAmount}`);
    console.log(`   Total Amount: ₦${cashOrderResult.data.placeOrder.orderAmount}\n`);
  } catch (error) {
    console.error('❌ Cash Order Failed:', error.message);
  }

  // Test Card Payment Order
  console.log('2. Testing Card Payment Order...');
  try {
    const cardOrderResult = await client.mutate({
      mutation: PLACE_ORDER,
      variables: {
        restaurant: "1",
        orderInput: [
          {
            title: "Pizza Margherita",
            quantity: 1,
            price: 3500
          }
        ],
        paymentMethod: "CARD",
        couponCode: null,
        tipping: 350,
        taxationAmount: 262.5,
        address: {
          deliveryAddress: "456 Another Street, Lagos",
          latitude: 6.4541,
          longitude: 3.3947
        },
        orderDate: new Date().toISOString(),
        isPickedUp: false,
        deliveryCharges: 500,
        instructions: "Test card payment order"
      }
    });

    console.log('✅ Card Order Success:');
    console.log(`   Order ID: ${cardOrderResult.data.placeOrder.orderId}`);
    console.log(`   Status: ${cardOrderResult.data.placeOrder.orderStatus}`);
    console.log(`   Paid Amount: ₦${cardOrderResult.data.placeOrder.paidAmount}`);
    console.log(`   Total Amount: ₦${cardOrderResult.data.placeOrder.orderAmount}\n`);
  } catch (error) {
    console.error('❌ Card Order Failed:', error.message);
  }

  // Test Bank Transfer Order
  console.log('3. Testing Bank Transfer Order...');
  try {
    const bankOrderResult = await client.mutate({
      mutation: PLACE_ORDER,
      variables: {
        restaurant: "1",
        orderInput: [
          {
            title: "Shawarma",
            quantity: 3,
            price: 1200
          }
        ],
        paymentMethod: "BANK",
        couponCode: null,
        tipping: 0,
        taxationAmount: 270,
        address: {
          deliveryAddress: "789 Bank Street, Lagos",
          latitude: 6.5044,
          longitude: 3.3692
        },
        orderDate: new Date().toISOString(),
        isPickedUp: false,
        deliveryCharges: 500,
        instructions: "Test bank transfer order"
      }
    });

    console.log('✅ Bank Transfer Order Success:');
    console.log(`   Order ID: ${bankOrderResult.data.placeOrder.orderId}`);
    console.log(`   Status: ${bankOrderResult.data.placeOrder.orderStatus}`);
    console.log(`   Paid Amount: ₦${bankOrderResult.data.placeOrder.paidAmount}`);
    console.log(`   Total Amount: ₦${bankOrderResult.data.placeOrder.orderAmount}\n`);
  } catch (error) {
    console.error('❌ Bank Transfer Order Failed:', error.message);
  }

  console.log('🎉 Order Flow Testing Complete!');
}

// Run the test
testOrderFlow().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});