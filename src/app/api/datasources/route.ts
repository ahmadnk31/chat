import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding, splitTextIntoChunks } from '@/lib/ai';
import { extractTextFromWebsite, cleanText } from '@/lib/text-processing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatbotId, type, name, url, content } = body;

    console.log('Creating data source:', { chatbotId, type, name, url: url ? url.substring(0, 100) : 'N/A' });

    if (!chatbotId) {
      return NextResponse.json(
        { error: 'Chatbot ID is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Data source type is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Data source name is required' },
        { status: 400 }
      );
    }

    // Check if the chatbot exists
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    let processedContent = '';
    let sourceUrl = null;

    try {
      if (type === 'URL' || type === 'WEBSITE') {
        if (!url) {
          return NextResponse.json(
            { error: 'URL is required for website data sources' },
            { status: 400 }
          );
        }
        
        console.log('Extracting text from website:', url);
        processedContent = await extractTextFromWebsite(url);
        sourceUrl = url;
        console.log('Successfully extracted text, length:', processedContent.length);
      } else if (type === 'TEXT') {
        if (!content) {
          return NextResponse.json(
            { error: 'Content is required for text data sources' },
            { status: 400 }
          );
        }
        processedContent = cleanText(content);
      } else {
        return NextResponse.json(
          { error: `Unsupported data source type: ${type}` },
          { status: 400 }
        );
      }

      if (!processedContent || processedContent.length < 10) {
        throw new Error('No meaningful content could be extracted');
      }

      console.log('Creating data source record in database');
      // Create data source record
      const dataSource = await prisma.dataSource.create({
        data: {
          chatbotId: chatbotId,
          type: type === 'WEBSITE' ? 'WEBSITE' : type,
          name: name,
          url: sourceUrl,
          content: processedContent,
          status: 'PROCESSING',
        },
      });

      console.log('Data source created, generating embeddings');
      // Split content into chunks
      const chunks = splitTextIntoChunks(processedContent, 1000);
      console.log(`Split content into ${chunks.length} chunks`);

      // Generate embeddings for each chunk
      let successfulChunks = 0;
      for (const chunk of chunks) {
        try {
          const embedding = await generateEmbedding(chunk);
          await prisma.contentChunk.create({
            data: {
              dataSourceId: dataSource.id,
              content: chunk,
              embedding: JSON.stringify(embedding),
              metadata: JSON.stringify({
                source: name,
                type: type,
              }),
            },
          });
          successfulChunks++;
        } catch (embeddingError) {
          console.error('Error generating embedding for chunk:', embeddingError);
        }
      }

      console.log(`Successfully processed ${successfulChunks}/${chunks.length} chunks`);

      // Update data source status
      await prisma.dataSource.update({
        where: { id: dataSource.id },
        data: { 
          status: successfulChunks > 0 ? 'COMPLETED' : 'FAILED',
          errorMessage: successfulChunks === 0 ? 'Failed to generate embeddings' : null
        },
      });

      return NextResponse.json({
        ...dataSource,
        chunksProcessed: successfulChunks,
        totalChunks: chunks.length
      });

    } catch (sourceError) {
      console.error(`Error processing data source ${name}:`, sourceError);
      
      // Create failed data source record
      const dataSource = await prisma.dataSource.create({
        data: {
          chatbotId: chatbotId,
          type: type === 'WEBSITE' ? 'WEBSITE' : type,
          name: name,
          url: sourceUrl,
          content: '',
          status: 'FAILED',
          errorMessage: sourceError instanceof Error ? sourceError.message : 'Unknown error',
        },
      });

      return NextResponse.json(
        { 
          error: sourceError instanceof Error ? sourceError.message : 'Failed to process data source',
          dataSource,
          details: 'The data source was saved with FAILED status for debugging'
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('Error creating data source:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create data source',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
