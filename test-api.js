// Test script to verify API integration
async function testUserAPI() {
  try {
    console.log('Testing User API...');
    
    // Test GET user
    const response = await fetch('http://localhost:3000/api/users/demo-user-id');
    const userData = await response.json();
    console.log('User data:', userData);
    
    // Test API usage
    const usageResponse = await fetch('http://localhost:3000/api/users/demo-user-id/api-usage');
    const usageData = await usageResponse.json();
    console.log('API usage:', usageData);
    
    // Test update user settings
    const updateResponse = await fetch('http://localhost:3000/api/users/demo-user-id', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Demo User',
        emailNotifications: false,
      }),
    });
    const updatedUser = await updateResponse.json();
    console.log('Updated user:', updatedUser);
    
    console.log('All API tests passed!');
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testUserAPI();
