import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {id}=await params
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: id },
      include: {
        dataSources: {
          include: {
            _count: {
              select: {
                chunks: true,
              },
            },
          },
        },
        _count: {
          select: {
            conversations: true,
          },
        },
      },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chatbot' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {id}=await params
    const body = await request.json();
    const { name, description, welcomeMessage, placeholder, primaryColor, isPublic } = body;

    const chatbot = await prisma.chatbot.update({
      where: { id: id },
      data: {
        name,
        description,
        welcomeMessage,
        placeholder,
        primaryColor,
        isPublic,
      },
    });

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error('Error updating chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to update chatbot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {id}=await params
    await prisma.chatbot.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to delete chatbot' },
      { status: 500 }
    );
  }
}
