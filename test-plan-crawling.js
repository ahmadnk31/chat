// Test script for plan-based documentation crawling
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPlanBasedCrawling() {
  try {
    console.log('🧪 Testing plan-based documentation crawling...\n');

    // Test data
    const testUrls = [
      'https://ui.shadcn.com/docs/installation',
      'https://ui.shadcn.com/docs/components/button'
    ];

    // Find a test chatbot
    const chatbot = await prisma.chatbot.findFirst({
      include: {
        user: true
      }
    });

    if (!chatbot) {
      console.log('❌ No chatbot found. Please create a chatbot first.');
      return;
    }

    console.log(`📱 Found chatbot: ${chatbot.name} (ID: ${chatbot.id})`);
    console.log(`👤 User: ${chatbot.user.email} (Plan: ${chatbot.user.subscriptionPlan || 'free'})`);

    // Test the docs-crawl API
    const response = await fetch('http://localhost:3000/api/docs-crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatbotId: chatbot.id,
        baseUrl: 'https://ui.shadcn.com',
        urls: testUrls,
        name: 'Test shadcn/ui Documentation',
        description: 'Test crawl for plan verification'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ API Error:', error);
      return;
    }

    const result = await response.json();
    console.log('\n✅ Crawling completed successfully!');
    console.log(`📊 Summary:`, result.summary);
    
    if (result.results) {
      console.log('\n📄 Individual results:');
      result.results.forEach((res, index) => {
        console.log(`  ${index + 1}. ${res.url}`);
        console.log(`     Success: ${res.success ? '✅' : '❌'}`);
        if (res.success) {
          console.log(`     Method: ${res.method}`);
          console.log(`     Chunks: ${res.chunks}`);
          console.log(`     Content: ${res.contentLength} chars`);
          if (res.title) {
            console.log(`     Title: ${res.title}`);
          }
        } else {
          console.log(`     Error: ${res.error}`);
        }
        console.log('');
      });
    }

    // Verify data in database
    const dataSourceCount = await prisma.dataSource.count({
      where: { chatbotId: chatbot.id }
    });

    const chunkCount = await prisma.contentChunk.count({
      where: {
        dataSource: {
          chatbotId: chatbot.id
        }
      }
    });

    console.log(`\n📊 Database verification:`);
    console.log(`   Data sources: ${dataSourceCount}`);
    console.log(`   Content chunks: ${chunkCount}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPlanBasedCrawling();
