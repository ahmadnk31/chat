const axios = require('axios');

async function testServer() {
    try {
        console.log('🌐 Testing server connection...');
        const response = await axios.get('http://localhost:3000', {
            timeout: 5000
        });
        console.log('✅ Server is running on port 3000');
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running on port 3000');
        } else {
            console.log('❌ Server error:', error.message);
        }
        return false;
    }
}

testServer();
