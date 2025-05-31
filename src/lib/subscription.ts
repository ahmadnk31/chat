import { prisma } from '@/lib/prisma';

export interface UserPlan {
  plan: 'free' | 'pro' | 'enterprise';
  status: string;
  hasFirecrawlAccess: boolean;
  features: {
    maxChatbots: number;
    maxDataSources: number;
    maxUrlsPerCrawl: number;
    advancedCrawling: boolean;
    prioritySupport: boolean;
  };
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionExpiry: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const plan = user.subscriptionPlan as 'free' | 'pro' | 'enterprise';
  const status = user.subscriptionStatus;
  const isActive = !user.subscriptionExpiry || user.subscriptionExpiry > new Date();

  const planFeatures = {
    free: {
      maxChatbots: 3,
      maxDataSources: 10,
      maxUrlsPerCrawl: 5,
      advancedCrawling: false,
      prioritySupport: false,
    },
    pro: {
      maxChatbots: 25,
      maxDataSources: 100,
      maxUrlsPerCrawl: 50,
      advancedCrawling: true,
      prioritySupport: true,
    },
    enterprise: {
      maxChatbots: -1, // unlimited
      maxDataSources: -1, // unlimited
      maxUrlsPerCrawl: 200,
      advancedCrawling: true,
      prioritySupport: true,
    },
  };

  return {
    plan,
    status,
    hasFirecrawlAccess: (plan === 'pro' || plan === 'enterprise') && isActive,
    features: planFeatures[plan],
  };
}

export async function getUserPlanByChatbotId(chatbotId: string): Promise<UserPlan> {
  const chatbot = await prisma.chatbot.findUnique({
    where: { id: chatbotId },
    include: {
      user: {
        select: {
          id: true,
          subscriptionStatus: true,
          subscriptionPlan: true,
          subscriptionExpiry: true,
        },
      },
    },
  });

  if (!chatbot) {
    throw new Error('Chatbot not found');
  }

  return getUserPlan(chatbot.user.id);
}
