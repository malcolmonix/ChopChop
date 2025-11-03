// Test the exact mutation that's failing
async function testOrderMutation() {
  console.log('🧪 Testing Order Mutation...\n');

  const mutation = {
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
          title: "Test Item",
          quantity: 1,
          price: 1000
        }
      ],
      paymentMethod: "CASH",
      tipping: 0,
      taxationAmount: 0,
      address: {
        deliveryAddress: "Test Address",
        latitude: 6.5244,
        longitude: 3.3792
      },
      orderDate: new Date().toISOString(),
      isPickedUp: false,
      deliveryCharges: 0,
      instructions: null
    }
  };

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mutation)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return false;
    }
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:');
      result.errors.forEach((error, index) => {
        console.error(`  Error ${index + 1}:`, error.message);
        if (error.locations) {
          console.error(`    Location:`, error.locations);
        }
        if (error.path) {
          console.error(`    Path:`, error.path);
        }
      });
      return false;
    }

    console.log('✅ Order Success:');
    console.log('Result:', JSON.stringify(result.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Request Failed:', error.message);
    return false;
  }
}

// For Node.js environments that don't have fetch built-in
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testOrderMutation().then(success => {
  if (success) {
    console.log('\n🎉 Order mutation is working!');
  } else {
    console.log('\n❌ Order mutation failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});