import { NextRequest, NextResponse } from 'next/server'
import { canDeletePost } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

// DELETE - Deletar post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const canDelete = await canDeletePost(id)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Você não tem permissão para deletar este post' },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Post deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar post:', error)
    const message = error instanceof Error ? error.message : 'Erro ao deletar post'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
