import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, chunkId } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Generate embedding using the server-side AI function
    const embedding = await generateEmbedding(text);

    // If chunkId is provided, update the chunk in database
    if (chunkId) {
      await prisma.contentChunk.update({
        where: { id: chunkId },
        data: {
          embedding: JSON.stringify(embedding)
        }
      });

      return NextResponse.json({
        success: true,
        chunkId,
        embeddingLength: embedding.length,
        message: 'Embedding generated and saved'
      });
    }

    // Otherwise just return the embedding
    return NextResponse.json({
      success: true,
      embedding,
      embeddingLength: embedding.length
    });

  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}
