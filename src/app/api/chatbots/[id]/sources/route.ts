import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding, splitTextIntoChunks } from '@/lib/ai';
import { extractTextFromWebsite, cleanText } from '@/lib/text-processing';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, name, url, content } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Validate chatbot exists
    const chatbot = await prisma.chatbot.findUnique({
      where: { id },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    let sourceContent = '';
    let sourceUrl = null;

    try {
      if (type === 'URL') {
        if (!url) {
          return NextResponse.json(
            { error: 'URL is required for URL type' },
            { status: 400 }
          );
        }
        console.log('Extracting content from URL:', url);
        sourceContent = await extractTextFromWebsite(url);
        sourceUrl = url;
      } else if (type === 'TEXT') {
        if (!content) {
          return NextResponse.json(
            { error: 'Content is required for TEXT type' },
            { status: 400 }
          );
        }
        sourceContent = cleanText(content);
      } else {
        return NextResponse.json(
          { error: 'Unsupported data source type' },
          { status: 400 }
        );
      }

      if (!sourceContent || sourceContent.trim().length === 0) {
        return NextResponse.json(
          { error: 'No content could be extracted from the source' },
          { status: 400 }
        );
      }

      console.log('Content extracted, length:', sourceContent.length);

      // Create data source record
      const dataSource = await prisma.dataSource.create({
        data: {
          chatbotId: id,
          type,
          name,
          url: sourceUrl,
          content: sourceContent,
          status: 'PROCESSING',
        },
      });

      console.log('Data source created:', dataSource.id);

      // Split content into chunks
      const chunks = splitTextIntoChunks(sourceContent, 1000);
      console.log('Content split into', chunks.length, 'chunks');

      let successfulChunks = 0;
      let failedChunks = 0;

      // Generate embeddings for each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);
          const embedding = await generateEmbedding(chunk);
          
          await prisma.contentChunk.create({
            data: {
              dataSourceId: dataSource.id,
              content: chunk,
              embedding: JSON.stringify(embedding),
              metadata: JSON.stringify({
                source: name,
                type: type,
                chunkIndex: i,
                totalChunks: chunks.length,
              }),
            },
          });
          
          successfulChunks++;
        } catch (embeddingError) {
          console.error(`Error generating embedding for chunk ${i + 1}:`, embeddingError);
          failedChunks++;
        }
      }

      console.log(`Embeddings complete: ${successfulChunks} successful, ${failedChunks} failed`);

      // Update data source status
      const finalStatus = failedChunks === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS';
      await prisma.dataSource.update({
        where: { id: dataSource.id },
        data: { 
          status: finalStatus,
          errorMessage: failedChunks > 0 ? `${failedChunks} chunks failed to process` : null,
        },
      });

      return NextResponse.json({
        id: dataSource.id,
        message: `Data source created successfully. ${successfulChunks} chunks processed.`,
        chunksProcessed: successfulChunks,
        chunksFailed: failedChunks,
        status: finalStatus,
      });

    } catch (sourceError) {
      console.error(`Error processing data source ${name}:`, sourceError);
      
      // Create failed data source record if we haven't created one yet
      try {
        await prisma.dataSource.create({
          data: {
            chatbotId: id,
            type,
            name,
            url: sourceUrl,
            content: '',
            status: 'FAILED',
            errorMessage: sourceError instanceof Error ? sourceError.message : 'Unknown error',
          },
        });
      } catch (dbError) {
        console.error('Error creating failed data source record:', dbError);
      }

      return NextResponse.json(
        { 
          error: sourceError instanceof Error ? sourceError.message : 'Failed to process data source',
          details: 'Check the URL is accessible and contains readable content'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating data source:', error);
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Validate chatbot exists
    const chatbot = await prisma.chatbot.findUnique({
      where: { id },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    // Get all data sources for this chatbot
    const dataSources = await prisma.dataSource.findMany({
      where: { chatbotId: id },
      include: {
        _count: {
          select: {
            contentChunks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(dataSources);
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    );
  }
}
