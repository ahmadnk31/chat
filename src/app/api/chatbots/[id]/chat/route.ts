import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateChatResponse, findRelevantChunks, formatForChatDisplay } from '@/lib/ai';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Get chatbot
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: id },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        chatbotId: id,
        sessionId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId: id,
          sessionId,
        },
      });
    }    // Get recent conversation history for better context
    const recentMessages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Last 10 messages
    });

    // Format conversation history
    const conversationHistory = recentMessages
      .reverse()
      .map(msg => ({
        role: msg.role.toLowerCase() === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

    // Add the new user message
    conversationHistory.push({ role: 'user', content: message });

    // Get all content chunks for this chatbot
    const chunks = await prisma.contentChunk.findMany({
      where: {
        dataSource: {
          chatbotId: id,
        },
      },
      select: {
        content: true,
        embedding: true,
      },
    });

    // Find relevant context
    let context = '';
    if (chunks.length > 0) {
      const chunksWithEmbeddings = chunks
        .filter(chunk => chunk.embedding)
        .map(chunk => ({
          content: chunk.content,
          embedding: chunk.embedding as string,
        }));

      if (chunksWithEmbeddings.length > 0) {
        const relevantChunks = await findRelevantChunks(message, chunksWithEmbeddings, 3);
        context = relevantChunks.join('\n\n');
      }
    }    // Generate AI response
    const aiResponse = await generateChatResponse(
      conversationHistory,
      context
    );

    // Format the response for display
    const formattedResponse = await formatForChatDisplay(aiResponse);

    // Save user message (after getting conversation history)
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      },
    });

    // Save AI response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: formattedResponse.content,
      },
    });    return NextResponse.json({
      message: formattedResponse.content,
      sessionId,
      formatted: true,
      contentType: formattedResponse.type,
      hasFormatting: formattedResponse.hasFormatting,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
