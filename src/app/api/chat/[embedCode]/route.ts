import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateChatResponse, findRelevantChunks, formatForChatDisplay } from '@/lib/ai';

export async function GET(
  request: NextRequest,
  { params }: { params: { embedCode: string } }
) {
  try {
    const { embedCode } = await params;

    const chatbot = await prisma.chatbot.findUnique({
      where: { embedCode: embedCode },
      select: {
        id: true,
        name: true,
        type: true,
        welcomeMessage: true,
        placeholder: true,
        primaryColor: true,
        isPublic: true,
      },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    if (!chatbot.isPublic) {
      return NextResponse.json(
        { error: 'Chatbot is not publicly accessible' },
        { status: 403 }
      );
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chatbot' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { embedCode: string } }
) {
  try {
    const { embedCode } = await params;
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Get chatbot by embed code
    const chatbot = await prisma.chatbot.findUnique({
      where: { embedCode: embedCode },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    if (!chatbot.isPublic) {
      return NextResponse.json(
        { error: 'Chatbot is not publicly accessible' },
        { status: 403 }
      );
    }

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        chatbotId: chatbot.id,
        sessionId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId: chatbot.id,
          sessionId,
        },
      });
    }

    // Get recent conversation history for better context
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
          chatbotId: chatbot.id,
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
    }

    // Generate AI response
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
    });

    return NextResponse.json({
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
