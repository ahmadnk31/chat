import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTextFromPdf, cleanText } from '@/lib/text-processing';
import { generateEmbedding, splitTextIntoChunks } from '@/lib/ai';
import { uploadFileToS3 } from '@/lib/s3';
import { DataSourceType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chatbotId = formData.get('chatbotId') as string;
    const name = formData.get('name') as string;

    if (!file || !chatbotId) {
      return NextResponse.json(
        { error: 'File and chatbotId are required' },
        { status: 400 }
      );
    }    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and TXT files are supported' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );    }    // Extract text based on file type
    const buffer = Buffer.from(await file.arrayBuffer());
    let content: string;
    let sourceType: DataSourceType;

    if (file.type === 'application/pdf') {
      content = await extractTextFromPdf(buffer);
      sourceType = DataSourceType.PDF;
    } else if (file.type === 'text/plain') {
      content = buffer.toString('utf-8');
      sourceType = DataSourceType.TEXT;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    const cleanedContent = cleanText(content);

    // Upload file to S3
    const fileKey = await uploadFileToS3(
      buffer,
      file.name,
      file.type,
      chatbotId
    );

    // Create data source record
    const dataSource = await prisma.dataSource.create({
      data: {
        chatbotId,
        type: sourceType,
        name: name || file.name,
        content: cleanedContent,
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        status: 'PROCESSING',
      },
    });

    try {
      // Split content into chunks
      const chunks = splitTextIntoChunks(cleanedContent, 1000);

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
                source: name || file.name,
                type: 'PDF',
                filename: file.name,
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

      return NextResponse.json({
        success: true,
        dataSourceId: dataSource.id,
        chunksCreated: chunks.length,
      });
    } catch (processingError) {
      // Update data source status to failed
      await prisma.dataSource.update({
        where: { id: dataSource.id },
        data: {
          status: 'FAILED',
          errorMessage: processingError instanceof Error ? processingError.message : 'Processing failed',
        },
      });

      throw processingError;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
