import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// For demo purposes, we'll use a hardcoded user ID
// In a real app, this would come from authentication context
const DEMO_USER_ID = 'demo-user-id';

export async function GET(request: NextRequest) {
  try {
    // Get current user to filter data by user (direct database query for server-side)
    const user = await prisma.user.findUnique({
      where: { id: DEMO_USER_ID }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total chatbots for the user
    const totalChatbots = await prisma.chatbot.count({
      where: { userId: user.id }
    });

    // Get total conversations for user's chatbots
    const totalConversations = await prisma.conversation.count({
      where: {
        chatbot: { userId: user.id },
        createdAt: { gte: startDate }
      }
    });

    // Get total messages for user's chatbots
    const totalMessages = await prisma.message.count({
      where: {
        conversation: {
          chatbot: { userId: user.id }
        },
        createdAt: { gte: startDate }
      }
    });    // Get unique users (visitors) who interacted with user's chatbots
    const activeUsers = await prisma.conversation.findMany({
      where: {
        chatbot: { userId: user.id },
        createdAt: { gte: startDate }
      },
      select: { sessionId: true },
      distinct: ['sessionId']
    });    // Get daily stats for the time range
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(c.created_at) as date,
        COUNT(DISTINCT c.id) as conversations,
        COUNT(m.id) as messages
      FROM "conversations" c
      LEFT JOIN "messages" m ON c.id = m.conversation_id
      LEFT JOIN "chatbots" cb ON c.chatbot_id = cb.id
      WHERE cb.user_id = ${user.id}
        AND c.created_at >= ${startDate}
      GROUP BY DATE(c.created_at)
      ORDER BY date DESC
      LIMIT ${parseInt(timeRange.replace('d', ''))}
    ` as Array<{ date: Date; conversations: bigint; messages: bigint }>;

    // Get top performing chatbots
    const topChatbots = await prisma.chatbot.findMany({
      where: { userId: user.id },
      include: {
        conversations: {
          where: { createdAt: { gte: startDate } },
          include: {
            messages: {
              where: { createdAt: { gte: startDate } }
            }
          }
        }
      }
    });

    // Process top chatbots data
    const chatbotStats = topChatbots.map(chatbot => ({
      id: chatbot.id,
      name: chatbot.name,
      conversations: chatbot.conversations.length,
      messages: chatbot.conversations.reduce((total, conv) => total + conv.messages.length, 0)
    })).sort((a, b) => b.conversations - a.conversations).slice(0, 5);

    // Format daily stats for chart (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const weeklyStats = last7Days.map(dateStr => {
      const dayData = dailyStats.find(stat => 
        stat.date.toISOString().split('T')[0] === dateStr
      );
      
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        day: dayName,
        conversations: dayData ? Number(dayData.conversations) : 0,
        messages: dayData ? Number(dayData.messages) : 0
      };
    });

    const analyticsData = {
      totalChatbots,
      totalConversations,
      totalMessages,
      activeUsers: activeUsers.length,
      weeklyStats,
      topChatbots: chatbotStats,
      timeRange,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
