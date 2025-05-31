const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function generateEmbeddingsBatch() {
  try {
    console.log('🔍 Checking if development server is running...');
    
    // Check if server is running
    try {
      await axios.get('http://localhost:3000/api/chatbots', { timeout: 5000 });
      console.log('✅ Server is running');
    } catch (error) {
      console.error('❌ Development server is not running!');
      console.log('Please start the server first:');
      console.log('  npm run dev');
      console.log('Then run this script again.');
      process.exit(1);
    }
    
    console.log('🔍 Finding content chunks without embeddings...');

    // Find all content chunks that have empty embeddings
    const chunksWithoutEmbeddings = await prisma.contentChunk.findMany({
      where: {
        OR: [
          { embedding: JSON.stringify([]) },
          { embedding: null },
          { embedding: '' }
        ]
      },
      include: {
        dataSource: {
          select: {
            name: true,
            type: true,
            url: true,
            chatbotId: true
          }
        }
      }
    });

    console.log(`📦 Found ${chunksWithoutEmbeddings.length} chunks without embeddings`);

    if (chunksWithoutEmbeddings.length === 0) {
      console.log('✅ All chunks already have embeddings!');
      return;
    }

    // Prepare chunks for batch processing
    const chunksForAPI = chunksWithoutEmbeddings.map(chunk => ({
      id: chunk.id,
      content: chunk.content
    }));

    console.log('🚀 Sending batch request to generate embeddings...');
    console.log('This may take a few minutes depending on the number of chunks...');

    // Send batch request to API
    const response = await axios.post('http://localhost:3000/api/embeddings/batch', {
      chunks: chunksForAPI
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 300000 // 5 minutes timeout
    });

    const result = response.data;

    console.log('\n🎉 Batch embedding generation completed!');
    console.log(`✅ Successfully processed: ${result.processed} chunks`);
    console.log(`❌ Errors: ${result.errors} chunks`);
    console.log(`📊 Total: ${result.total} chunks`);

    if (result.errors > 0) {
      console.log('\n❌ Failed chunks:');
      result.results.filter(r => !r.success).forEach(r => {
        console.log(`   ${r.id}: ${r.error}`);
      });
    }

    if (result.processed > 0) {
      console.log('\n📊 Summary by data source:');
      const summary = {};
      for (const chunk of chunksWithoutEmbeddings) {
        const sourceName = chunk.dataSource.name;
        const wasProcessed = result.results.find(r => r.id === chunk.id && r.success);
        if (wasProcessed) {
          summary[sourceName] = (summary[sourceName] || 0) + 1;
        }
      }
      
      Object.entries(summary).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} chunks`);
      });
      
      console.log('\n🤖 Your chatbot should now work properly with semantic search!');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n💡 This might be due to:');
      console.log('   - OpenAI API key not set in .env.local');
      console.log('   - OpenAI API rate limits');
      console.log('   - Server configuration issues');
    }
  } finally {
    await prisma.$disconnect();
  }
}

generateEmbeddingsBatch().catch(console.error);
