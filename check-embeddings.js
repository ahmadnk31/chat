const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkContentChunksEmbeddings() {
  try {
    console.log('🔍 Checking content chunks and their embeddings...\n');

    // Find all content chunks
    const allChunks = await prisma.contentChunk.findMany({
      include: {
        dataSource: {
          select: {
            name: true,
            type: true,
            url: true,
            chatbotId: true
          }
        }
      },
      orderBy: {
        dataSource: {
          name: 'asc'
        }
      }
    });

    console.log(`📦 Total content chunks found: ${allChunks.length}\n`);

    // Group by data source
    const byDataSource = {};
    let chunksWithoutEmbeddings = 0;
    let chunksWithEmbeddings = 0;

    for (const chunk of allChunks) {
      const sourceName = chunk.dataSource.name;
      if (!byDataSource[sourceName]) {
        byDataSource[sourceName] = {
          total: 0,
          withEmbeddings: 0,
          withoutEmbeddings: 0,
          type: chunk.dataSource.type,
          url: chunk.dataSource.url
        };
      }

      byDataSource[sourceName].total++;

      // Check if embedding exists and is not empty
      const hasEmbedding = chunk.embedding && 
                          chunk.embedding !== '[]' && 
                          chunk.embedding !== '' && 
                          chunk.embedding !== null;

      if (hasEmbedding) {
        byDataSource[sourceName].withEmbeddings++;
        chunksWithEmbeddings++;
      } else {
        byDataSource[sourceName].withoutEmbeddings++;
        chunksWithoutEmbeddings++;
      }
    }

    // Display results
    console.log('📊 Summary by Data Source:');
    console.log('=' .repeat(80));

    Object.entries(byDataSource).forEach(([sourceName, stats]) => {
      console.log(`\n📁 ${sourceName}`);
      console.log(`   Type: ${stats.type}`);
      if (stats.url) console.log(`   URL: ${stats.url}`);
      console.log(`   Total chunks: ${stats.total}`);
      console.log(`   ✅ With embeddings: ${stats.withEmbeddings}`);
      console.log(`   ❌ Without embeddings: ${stats.withoutEmbeddings}`);
      
      if (stats.withoutEmbeddings > 0) {
        console.log(`   🔧 Needs embedding generation!`);
      } else {
        console.log(`   ✅ All chunks have embeddings`);
      }
    });

    console.log('\n' + '=' .repeat(80));
    console.log(`📈 Overall Summary:`);
    console.log(`   Total chunks: ${allChunks.length}`);
    console.log(`   ✅ With embeddings: ${chunksWithEmbeddings}`);
    console.log(`   ❌ Without embeddings: ${chunksWithoutEmbeddings}`);

    if (chunksWithoutEmbeddings > 0) {
      console.log(`\n🔧 Next Steps:`);
      console.log(`   1. Set your OPENAI_API_KEY environment variable`);
      console.log(`   2. Run: node generate-embeddings.js`);
      console.log(`   This will generate embeddings for ${chunksWithoutEmbeddings} chunks`);
    } else {
      console.log(`\n🎉 All content chunks have embeddings! The chatbot should work properly.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContentChunksEmbeddings().catch(console.error);
