import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating user settings
const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
  marketingNotifications: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(5).max(480).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

// GET /api/users/[id] - Get user settings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        apiKey: true,
        emailNotifications: true,
        browserNotifications: true,
        marketingNotifications: true,
        twoFactorEnabled: true,
        sessionTimeout: true,
        theme: true,
        language: true,
        timezone: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionExpiry: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user settings
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = updateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        apiKey: true,
        emailNotifications: true,
        browserNotifications: true,
        marketingNotifications: true,
        twoFactorEnabled: true,
        sessionTimeout: true,
        theme: true,
        language: true,
        timezone: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}
