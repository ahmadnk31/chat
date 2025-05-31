import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chunks } = body;

    if (!chunks || !Array.isArray(chunks)) {
      return NextResponse.json(
        { error: 'Chunks array is required' },
        { status: 400 }
      );
    }

    const results = [];
    let processed = 0;
    let errors = 0;

    for (const chunk of chunks) {
      try {
        const { id, content } = chunk;
        
        if (!id || !content) {
          console.log(`Skipping chunk with missing id or content`);
          continue;
        }

        // Generate embedding
        const embedding = await generateEmbedding(content);
        
        // Update the chunk in database
        await prisma.contentChunk.update({
          where: { id },
          data: {
            embedding: JSON.stringify(embedding)
          }
        });

        results.push({
          id,
          success: true,
          embeddingLength: embedding.length
        });

        processed++;

        // Add delay every 5 chunks to avoid rate limiting
        if (processed % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error processing chunk ${chunk.id}:`, error);
        results.push({
          id: chunk.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      total: chunks.length,
      results
    });

  } catch (error) {
    console.error('Error in batch embedding generation:', error);
    return NextResponse.json(
      { error: 'Failed to process batch embeddings' },
      { status: 500 }
    );
  }
}
