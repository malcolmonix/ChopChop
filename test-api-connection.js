// Test API connection first
async function testAPIConnection() {
  console.log('🔍 Testing API Connection...\n');

  // Simple query to test connection
  const testQuery = {
    query: `
      query {
        restaurants {
          _id
          name
          address
        }
      }
    `
  };

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuery)
    });

    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
      return false;
    }

    console.log('✅ API Connection Success');
    console.log(`Found ${result.data.restaurants.length} restaurants`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection Test Failed:', error.message);
    return false;
  }
}

// For Node.js environments that don't have fetch built-in
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testAPIConnection().then(success => {
  if (success) {
    console.log('\n🎉 API Connection is working!');
  } else {
    console.log('\n❌ API Connection failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});