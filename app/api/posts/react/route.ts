import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { postId, commentId, type } = await req.json();

    if (!type) {
      return NextResponse.json({ error: 'Tipo de reação é obrigatório' }, { status: 400 });
    }

    if (!postId && !commentId) {
      return NextResponse.json({ error: 'Post ID ou Comment ID é obrigatório' }, { status: 400 });
    }

    // Verificar se já existe essa reação do usuário
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        userId: session.user.id,
        type,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
    });

    if (existingReaction) {
      // Se já existe, remover (toggle off)
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });

      return NextResponse.json({
        success: true,
        action: 'removed',
        reactionId: null,
      });
    }

    // Criar nova reação
    const reaction = await prisma.reaction.create({
      data: {
        type,
        userId: session.user.id,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
    });

    // Criar notificação para o autor do post/comentário
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });

      if (post && post.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'REACTION_POST',
            userId: post.authorId,
            actorId: session.user.id,
            postId,
            message: `reagiu ao seu post com ${getReactionEmoji(type)}`,
          },
        });
      }
    } else if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true },
      });

      if (comment && comment.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'REACTION_COMMENT',
            userId: comment.authorId,
            actorId: session.user.id,
            commentId,
            message: `reagiu ao seu comentário com ${getReactionEmoji(type)}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      action: 'added',
      reactionId: reaction.id,
      type: reaction.type,
    });
  } catch (error) {
    console.error('Erro ao processar reação:', error);
    return NextResponse.json({ error: 'Erro ao processar reação' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    const commentId = searchParams.get('commentId');

    if (!postId && !commentId) {
      return NextResponse.json({ error: 'Post ID ou Comment ID é obrigatório' }, { status: 400 });
    }

    // Buscar todas as reações e agrupar por tipo
    const reactions = await prisma.reaction.findMany({
      where: {
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Agrupar por tipo
    const reactionsByType = reactions.reduce((acc: any, reaction) => {
      const type = reaction.type;
      if (!acc[type]) {
        acc[type] = {
          type,
          count: 0,
          users: [],
        };
      }
      acc[type].count += 1;
      acc[type].users.push(reaction.user);
      return acc;
    }, {});

    // Converter para array
    const reactionsArray = Object.values(reactionsByType);

    // Verificar quais reações o usuário atual fez
    const session = await getServerSession(authOptions);
    const userReactions = session?.user
      ? reactions
          .filter(r => r.userId === session.user.id)
          .map(r => r.type)
      : [];

    return NextResponse.json({
      reactions: reactionsArray,
      userReactions,
      totalCount: reactions.length,
    });
  } catch (error) {
    console.error('Erro ao buscar reações:', error);
    return NextResponse.json({ error: 'Erro ao buscar reações' }, { status: 500 });
  }
}

function getReactionEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    LIKE: '❤️',
    FIRE: '🔥',
    CLAP: '👏',
    THINKING: '🤔',
    CELEBRATE: '🎉',
    INSIGHTFUL: '💡',
  };
  return emojiMap[type] || '👍';
}
