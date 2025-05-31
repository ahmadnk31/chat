const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating sample data for analytics...');
    
    // First, ensure the demo user exists
    const user = await prisma.user.upsert({
      where: { id: 'demo-user-id' },
      update: {},
      create: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        apiKey: 'cb_live_demo123456789',
        subscriptionStatus: 'pro',
        subscriptionPlan: 'pro',
        subscriptionExpiry: new Date('2025-06-30'),
        stripeCustomerId: 'cus_demo123456',
        stripeSubscriptionId: 'sub_demo123456',
      },
    });
    console.log('Demo user created/updated:', user.email);

    // Create a sample chatbot if it doesn't exist
    const existingChatbot = await prisma.chatbot.findFirst({
      where: { userId: 'demo-user-id' }
    });

    let chatbot = existingChatbot;
    if (!chatbot) {
      chatbot = await prisma.chatbot.create({
        data: {
          name: 'Customer Support Bot',
          description: 'A helpful customer support chatbot',
          userId: 'demo-user-id',
          type: 'CUSTOMER_SUPPORT',
          welcomeMessage: 'Hello! How can I help you today?',
          placeholder: 'Type your message...',
          primaryColor: '#3B82F6',
          isPublic: true,
          embedCode: 'demo-bot-' + Date.now(),
        },
      });
      console.log('Sample chatbot created:', chatbot.name);
    } else {
      console.log('Using existing chatbot:', chatbot.name);
    }

    // Create sample conversations and messages
    const today = new Date();
    const conversations = [];
    
    for (let i = 0; i < 5; i++) {
      const conversationDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)); // Last 5 days
      
      const conversation = await prisma.conversation.create({
        data: {
          chatbotId: chatbot.id,
          sessionId: `session-${Date.now()}-${i}`,
          createdAt: conversationDate,
          updatedAt: conversationDate,
        },
      });
      
      // Add messages to this conversation
      const messageCount = Math.floor(Math.random() * 8) + 2; // 2-10 messages per conversation
      
      for (let j = 0; j < messageCount; j++) {
        const messageDate = new Date(conversationDate.getTime() + (j * 60000)); // 1 minute apart
        const isUserMessage = j % 2 === 0;
        
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: isUserMessage ? 'USER' : 'ASSISTANT',
            content: isUserMessage 
              ? `User question ${j + 1} from ${conversationDate.toDateString()}`
              : `Assistant response ${j + 1} from ${conversationDate.toDateString()}`,
            createdAt: messageDate,
          },
        });
      }
      
      conversations.push(conversation);
    }
    
    console.log(`Created ${conversations.length} conversations with messages`);
    
    // Display summary
    const totalConversations = await prisma.conversation.count({
      where: { chatbot: { userId: 'demo-user-id' } }
    });
    
    const totalMessages = await prisma.message.count({
      where: { conversation: { chatbot: { userId: 'demo-user-id' } } }
    });
    
    console.log(`\nSummary:`);
    console.log(`- Total conversations: ${totalConversations}`);
    console.log(`- Total messages: ${totalMessages}`);
    console.log(`- Analytics should now show data!`);
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
