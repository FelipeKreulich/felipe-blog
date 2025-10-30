import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Deletar comentário
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar comentário
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões (autor do comentário ou moderador/admin)
    const isAuthor = comment.authorId === session.user.id
    const isModerator = ['MODERATOR', 'ADMIN'].includes(session.user.role)

    if (!isAuthor && !isModerator) {
      return NextResponse.json(
        { error: 'Você não tem permissão para deletar este comentário' },
        { status: 403 }
      )
    }

    // Deletar comentário (cascade vai deletar respostas automaticamente)
    await prisma.comment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar comentário:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar comentário' },
      { status: 500 }
    )
  }
}
