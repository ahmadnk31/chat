const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkChatbot() {
  try {
    console.log('Checking for chatbot with embedCode: cmbb6ayes0002mxccs9hdjej7');
    
    const chatbot = await prisma.chatbot.findUnique({
      where: { embedCode: 'cmbb6ayes0002mxccs9hdjej7' },
      select: {
        id: true,
        name: true,
        embedCode: true,
        isPublic: true,
        type: true
      }
    });
    
    if (chatbot) {
      console.log('✅ Chatbot found:', JSON.stringify(chatbot, null, 2));
    } else {
      console.log('❌ Chatbot not found with embedCode: cmbb6ayes0002mxccs9hdjej7');
      
      // Let's also check what chatbots exist
      console.log('\nLooking for existing chatbots...');
      const allChatbots = await prisma.chatbot.findMany({
        select: {
          id: true,
          name: true,
          embedCode: true,
          isPublic: true,
          type: true
        },
        take: 10
      });
      
      if (allChatbots.length > 0) {
        console.log('📋 Available chatbots:');
        allChatbots.forEach((bot, index) => {
          console.log(`${index + 1}. ${bot.name} (${bot.embedCode}) - Public: ${bot.isPublic}, Type: ${bot.type}`);
        });
      } else {
        console.log('📭 No chatbots found in database');
      }
    }
  } catch (error) {
    console.error('💥 Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChatbot();
