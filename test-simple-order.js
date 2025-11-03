// Simple test without external dependencies
async function testOrderAPI() {
  console.log('🧪 Testing Order API...\n');

  const testCashOrder = {
    query: `
      mutation PlaceOrder(
        $restaurant: String!
        $orderInput: [OrderInput!]!
        $paymentMethod: String!
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
    `,
    variables: {
      restaurant: "1",
      orderInput: [
        {
          title: "Jollof Rice",
          quantity: 2,
          price: 1500
        }
      ],
      paymentMethod: "CASH",
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
      instructions: "Test cash order"
    }
  };

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCashOrder)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
      return false;
    }

    console.log('✅ Cash Order Test Success:');
    console.log(`   Order ID: ${result.data.placeOrder.orderId}`);
    console.log(`   Status: ${result.data.placeOrder.orderStatus}`);
    console.log(`   Paid Amount: ₦${result.data.placeOrder.paidAmount}`);
    console.log(`   Total Amount: ₦${result.data.placeOrder.orderAmount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Order Test Failed:', error.message);
    return false;
  }
}

// For Node.js environments that don't have fetch built-in
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testOrderAPI().then(success => {
  if (success) {
    console.log('\n🎉 Order API is working correctly!');
  } else {
    console.log('\n❌ Order API test failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});