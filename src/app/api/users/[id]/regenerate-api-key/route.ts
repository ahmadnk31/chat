import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/users/[id]/regenerate-api-key - Regenerate user's API key
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Generate a new API key
    const newApiKey = 'cb_live_' + Math.random().toString(36).substring(2, 18);

    const user = await prisma.user.update({
      where: { id },
      data: { apiKey: newApiKey },
      select: {
        id: true,
        apiKey: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      apiKey: user.apiKey,
      message: 'API key regenerated successfully',
    });
  } catch (error) {
    console.error('Failed to regenerate API key:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate API key' },
      { status: 500 }
    );
  }
}
