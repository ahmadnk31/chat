const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkChatbotData() {
  try {
    console.log('Checking chatbot data...\n');
    
    // Get the specific chatbot from your test file
    const chatbotId = 'cmbb6ayes0002mxccs9hdjej7';
    
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        dataSources: {
          include: {
            _count: {
              select: { chunks: true }
            }
          }
        }
      }
    });

    if (!chatbot) {
      console.log('❌ Chatbot not found with ID:', chatbotId);
      
      // Let's see what chatbots exist
      const allChatbots = await prisma.chatbot.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          _count: {
            select: { dataSources: true }
          }
        }
      });
      
      console.log('\n📋 Available chatbots:');
      allChatbots.forEach(bot => {
        console.log(`- ${bot.name} (${bot.id}) - Type: ${bot.type} - Sources: ${bot._count.dataSources}`);
      });
      
      return;
    }

    console.log('✅ Found chatbot:', chatbot.name);
    console.log('📊 Type:', chatbot.type);
    console.log('📊 Data sources:', chatbot.dataSources.length);
    
    if (chatbot.dataSources.length === 0) {
      console.log('\n⚠️  No data sources found for this chatbot!');
      console.log('   This is why the chatbot can\'t answer specific questions.');
      console.log('   You need to add some data sources (websites, files, etc.)');
      return;
    }

    console.log('\n📋 Data Sources:');
    chatbot.dataSources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.name}`);
      console.log(`   Type: ${source.type}`);
      console.log(`   Status: ${source.status}`);
      console.log(`   URL: ${source.url || 'N/A'}`);
      console.log(`   Content length: ${source.content.length} characters`);
      console.log(`   Chunks: ${source._count.chunks}`);
      if (source.errorMessage) {
        console.log(`   ❌ Error: ${source.errorMessage}`);
      }
      console.log('');
    });

    // Check if any data sources failed
    const failedSources = chatbot.dataSources.filter(s => s.status === 'FAILED');
    if (failedSources.length > 0) {
      console.log('❌ Failed data sources found!');
      console.log('   These sources couldn\'t be processed and won\'t provide answers.');
    }

    // Check if content chunks exist
    const totalChunks = chatbot.dataSources.reduce((sum, source) => sum + source._count.chunks, 0);
    if (totalChunks === 0) {
      console.log('⚠️  No content chunks found!');
      console.log('   This means the content couldn\'t be processed into searchable pieces.');
    } else {
      console.log(`✅ Total searchable chunks: ${totalChunks}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChatbotData();
