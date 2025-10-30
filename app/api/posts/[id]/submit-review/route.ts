import { NextRequest, NextResponse } from 'next/server'
import { canEditPost } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

// POST - Enviar post para revisão (Writer)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const canEdit = await canEditPost(id)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Você não tem permissão para enviar este post para revisão' },
        { status: 403 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { status: true },
    })

    if (post?.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Apenas posts em rascunho podem ser enviados para revisão' },
        { status: 400 }
      )
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: 'PENDING_REVIEW',
      },
    })

    return NextResponse.json({
      post: updatedPost,
      message: 'Post enviado para revisão com sucesso',
    })
  } catch (error) {
    console.error('Erro ao enviar post para revisão:', error)
    const message = error instanceof Error ? error.message : 'Erro ao enviar post para revisão'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
