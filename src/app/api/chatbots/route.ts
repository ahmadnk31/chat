import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding, splitTextIntoChunks } from '@/lib/ai';
import { extractTextFromWebsite, cleanText } from '@/lib/text-processing';

export async function GET() {
  try {
    const chatbots = await prisma.chatbot.findMany({
      include: {
        _count: {
          select: {
            dataSources: true,
            conversations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(chatbots);
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chatbots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, welcomeMessage, placeholder, primaryColor, dataSources = [] } = body;

    // Validate chatbot type
    const validChatbotTypes = ['CUSTOMER_SUPPORT', 'DOCS_SEARCH_ENGINE'];
    const chatbotType = type && validChatbotTypes.includes(type) ? type : 'CUSTOMER_SUPPORT';

    // Create chatbot
    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        description,
        type: chatbotType,
        welcomeMessage,
        placeholder,
        primaryColor,
        isPublic: true, // Make chatbots public by default for demo purposes
        userId: 'demo-user-id', // Use the demo user from seed
      },
    });

    // Process data sources (only if provided)
    if (dataSources && Array.isArray(dataSources)) {
      for (const source of dataSources) {
      let content = '';
      let sourceUrl = null;

      try {
        if (source.type === 'URL') {
          content = await extractTextFromWebsite(source.url);
          sourceUrl = source.url;
        } else if (source.type === 'TEXT') {
          content = cleanText(source.content);
        } else if (source.type === 'PDF') {
          // For now, we'll handle PDF processing in a separate endpoint
          // since we need to handle file uploads differently
          continue;
        }

        if (content) {
          // Create data source record
          const dataSource = await prisma.dataSource.create({
            data: {
              chatbotId: chatbot.id,
              type: source.type,
              name: source.name,
              url: sourceUrl,
              content,
              status: 'PROCESSING',
            },
          });

          // Split content into chunks
          const chunks = splitTextIntoChunks(content, 1000);

          // Generate embeddings for each chunk
          for (const chunk of chunks) {
            try {
              const embedding = await generateEmbedding(chunk);
                await prisma.contentChunk.create({
                data: {
                  dataSourceId: dataSource.id,
                  content: chunk,
                  embedding: JSON.stringify(embedding),
                  metadata: JSON.stringify({
                    source: source.name,
                    type: source.type,
                  }),
                },
              });
            } catch (embeddingError) {
              console.error('Error generating embedding for chunk:', embeddingError);
            }
          }

          // Update data source status
          await prisma.dataSource.update({
            where: { id: dataSource.id },
            data: { status: 'COMPLETED' },
          });
        }
      } catch (sourceError) {
        console.error(`Error processing data source ${source.name}:`, sourceError);
        
        // Create failed data source record
        await prisma.dataSource.create({
          data: {
            chatbotId: chatbot.id,
            type: source.type,
            name: source.name,
            url: sourceUrl,
            content: '',
            status: 'FAILED',
            errorMessage: sourceError instanceof Error ? sourceError.message : 'Unknown error',
          },
        });      }
    }
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error('Error creating chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to create chatbot' },
      { status: 500 }
    );
  }
}
