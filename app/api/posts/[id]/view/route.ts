import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verifica se o post existe
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, published: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    if (!post.published) {
      return NextResponse.json({ error: 'Post não publicado' }, { status: 403 });
    }

    // Obtém IP e User Agent para evitar contagem duplicada
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Verifica se já existe uma view deste IP/UserAgent nas últimas 24h
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const existingView = await prisma.postView.findFirst({
      where: {
        postId: id,
        ipAddress,
        userAgent,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    // Se já existe uma view recente, não conta novamente
    if (existingView) {
      return NextResponse.json({
        success: true,
        counted: false,
        message: 'View já contabilizada'
      });
    }

    // Cria nova view
    await prisma.postView.create({
      data: {
        postId: id,
        ipAddress,
        userAgent,
      }
    });

    return NextResponse.json({
      success: true,
      counted: true,
      message: 'View registrada'
    });

  } catch (error) {
    console.error('Erro ao registrar view:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar visualização' },
      { status: 500 }
    );
  }
}
