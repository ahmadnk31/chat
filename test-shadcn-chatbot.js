const axios = require('axios');

async function testShadcnChatbot() {
    const chatbotId = 'cmbb6ayes0002mxccs9hdjej7'; // shadcn docs chatbot
    const testQueries = [
        'how to install shadcn',
        'shadcn installation next.js',
        'install shadcn ui',
        'button component',
        'form component'
    ];

    console.log('🧪 Testing shadcn chatbot functionality...\n');

    for (const query of testQueries) {
        console.log(`\n📝 Testing query: "${query}"`);
        console.log('=' .repeat(50));
          try {
            const response = await axios.post(`http://localhost:3000/api/chatbots/${chatbotId}/chat`, {
                message: query,
                sessionId: 'test-' + Math.random().toString(36).substring(7)
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });            if (response.data && response.data.message) {
                console.log(`✅ Response received:`);
                console.log(`   Message: ${response.data.message.substring(0, 200)}${response.data.message.length > 200 ? '...' : ''}`);
            } else {
                console.log('❌ No message in response');
            }        } catch (error) {
            console.error('❌ Error testing query:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        }
    }
}

testShadcnChatbot().catch(console.error);
