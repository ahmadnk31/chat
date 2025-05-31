import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id]/api-usage - Get user's API usage statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Get the current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Count messages sent this month for the user's chatbots
    const messageCount = await prisma.message.count({
      where: {
        conversation: {
          chatbot: {
            userId: id,
          },
        },        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        role: 'USER', // Only count user messages as API calls
      },
    });

    // Define usage limits (can be made configurable later)
    const monthlyLimit = 10000;
    const usagePercentage = (messageCount / monthlyLimit) * 100;

    return NextResponse.json({
      currentUsage: messageCount,
      monthlyLimit,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to fetch API usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API usage' },
      { status: 500 }
    );
  }
}
