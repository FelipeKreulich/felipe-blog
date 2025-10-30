import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Permission } from '@/types/permissions'

// PATCH - Aprovar/Rejeitar comentário
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requirePermission(Permission.MODERATE_COMMENTS)
    const { approved } = await req.json()

    const comment = await prisma.comment.update({
      where: { id },
      data: { approved },
    })

    return NextResponse.json({
      comment,
      message: approved ? 'Comentário aprovado' : 'Comentário rejeitado'
    })
  } catch (error) {
    console.error('Erro ao moderar comentário:', error)
    const message = error instanceof Error ? error.message : 'Erro ao moderar comentário'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

// DELETE - Deletar comentário
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requirePermission(Permission.DELETE_ANY_COMMENT)

    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Comentário deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar comentário:', error)
    const message = error instanceof Error ? error.message : 'Erro ao deletar comentário'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
