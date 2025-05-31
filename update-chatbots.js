const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Update all chatbots to be public
    const result = await prisma.chatbot.updateMany({
      where: {
        isPublic: false
      },
      data: {
        isPublic: true
      }
    });

    console.log(`Updated ${result.count} chatbots to be public`);
    
    // List all chatbots to verify
    const chatbots = await prisma.chatbot.findMany({
      select: {
        id: true,
        name: true,
        embedCode: true,
        isPublic: true
      }
    });
    
    console.log('All chatbots:');
    chatbots.forEach(chatbot => {
      console.log(`- ${chatbot.name} (${chatbot.embedCode}): Public = ${chatbot.isPublic}`);
    });
    
  } catch (error) {
    console.error('Error updating chatbots:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
