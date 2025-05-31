const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function generateEmbeddingViaAPI(chunkId, content) {
  try {
    const response = await axios.post('http://localhost:3000/api/embeddings', {
      text: content,
      chunkId: chunkId
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calling embedding API:', error.response?.data || error.message);
    throw new Error('Failed to generate embedding via API');
  }
}

async function generateEmbeddingsForExistingContent() {
  try {
    console.log('🔍 Checking if development server is running...');
    
    const serverRunning = await checkServerHealth();
    if (!serverRunning) {
      console.error('❌ Development server is not running!');
      console.log('Please start the server first:');
      console.log('  npm run dev');
      console.log('Then run this script again.');
      process.exit(1);
    }
    
    console.log('✅ Server is running');
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

    let processed = 0;
    let errors = 0;

    for (const chunk of chunksWithoutEmbeddings) {
      try {
        console.log(`\n📝 Processing chunk ${processed + 1}/${chunksWithoutEmbeddings.length}`);
        console.log(`   Source: ${chunk.dataSource.name}`);        console.log(`   Content preview: ${chunk.content.substring(0, 100)}...`);

        // Generate embedding via API
        const result = await generateEmbeddingViaAPI(chunk.id, chunk.content);
        
        processed++;
        console.log(`   ✅ Generated embedding with ${result.embeddingLength} dimensions`);

        // Add a small delay to avoid rate limiting
        if (processed % 5 === 0) {
          console.log('   ⏳ Pausing to avoid rate limits...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`   ❌ Error processing chunk ${chunk.id}:`, error.message);
        errors++;
      }
    }

    console.log('\n🎉 Embedding generation completed!');
    console.log(`✅ Successfully processed: ${processed} chunks`);
    console.log(`❌ Errors: ${errors} chunks`);

    if (processed > 0) {
      console.log('\n📊 Summary by data source:');
      const summary = {};
      for (const chunk of chunksWithoutEmbeddings.slice(0, processed)) {
        const sourceName = chunk.dataSource.name;
        summary[sourceName] = (summary[sourceName] || 0) + 1;
      }
      
      Object.entries(summary).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} chunks`);
      });
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await axios.get('http://localhost:3000/api/chatbots', {
      timeout: 5000
    });
    return true;
  } catch (error) {
    return false;
  }
}

generateEmbeddingsForExistingContent().catch(console.error);
