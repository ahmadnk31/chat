const { PrismaClient } = require('@prisma/client');
const { findRelevantChunks, generateChatResponse, formatForChatDisplay, cleanMarkdownFormatting } = require('./src/lib/ai.ts');

const prisma = new PrismaClient();

async function testAIFormatting() {
  try {
    console.log('🧪 Testing AI formatting and knowledge retrieval...\n');

    // Get the chatbot
    const chatbot = await prisma.chatbot.findFirst({
      where: { name: 'shadcn docs' }
    });

    if (!chatbot) {
      console.error('❌ Chatbot not found');
      return;
    }

    console.log(`✅ Found chatbot: ${chatbot.name}`);
    console.log(`📋 Embed code: ${chatbot.embedCode}\n`);

    // Get content chunks
    const chunks = await prisma.contentChunk.findMany({
      where: {
        dataSource: {
          chatbotId: chatbot.id,
        },
      },
      select: {
        content: true,
        embedding: true,
      },
    });

    console.log(`📊 Found ${chunks.length} total chunks`);

    const chunksWithEmbeddings = chunks
      .filter(chunk => chunk.embedding)
      .map(chunk => ({
        content: chunk.content,
        embedding: chunk.embedding,
      }));

    console.log(`📊 ${chunksWithEmbeddings.length} chunks have embeddings\n`);

    // Test queries
    const testQueries = [
      "How do I install shadcn/ui with Next.js?",
      "What is a button component?",
      "How do I use forms with shadcn?",
      "Tell me about PDF content" // This should find the PDF content
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      console.log('=' .repeat(50));

      try {
        // Find relevant chunks with different thresholds
        console.log('\n📋 Finding relevant chunks...');
        let relevantChunks = await findRelevantChunks(query, chunksWithEmbeddings, 3, 0.5);
        console.log(`Found ${relevantChunks.length} chunks with 0.5 threshold`);
        
        if (relevantChunks.length === 0) {
          relevantChunks = await findRelevantChunks(query, chunksWithEmbeddings, 3, 0.3);
          console.log(`Found ${relevantChunks.length} chunks with 0.3 threshold`);
        }
        
        if (relevantChunks.length === 0) {
          relevantChunks = await findRelevantChunks(query, chunksWithEmbeddings, 3, 0.0);
          console.log(`Using top 3 chunks regardless of similarity`);
        }

        const context = relevantChunks.join('\n\n');
        console.log(`\n📄 Context length: ${context.length} characters`);
        console.log(`📄 Context preview: ${context.substring(0, 200)}...\n`);

        // Generate AI response
        console.log('🤖 Generating AI response...');
        const messages = [{ role: 'user', content: query }];
        const aiResponse = await generateChatResponse(messages, context);

        console.log('\n📝 Raw AI Response:');
        console.log('-'.repeat(30));
        console.log(aiResponse);
        
        // Test the cleaning function
        console.log('\n🧹 Cleaned Response:');
        console.log('-'.repeat(30));
        const cleanedResponse = cleanMarkdownFormatting(aiResponse);
        console.log(cleanedResponse);

        // Test the formatting function
        console.log('\n💅 Formatted Response:');
        console.log('-'.repeat(30));
        const formattedResponse = formatForChatDisplay(cleanedResponse);
        console.log('Content:', formattedResponse.content);
        console.log('Type:', formattedResponse.type);
        console.log('Has formatting:', formattedResponse.hasFormatting);

        console.log('\n' + '='.repeat(80));
      } catch (error) {
        console.error(`❌ Error testing query "${query}":`, error);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAIFormatting().catch(console.error);
