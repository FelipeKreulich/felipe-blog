import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Permission } from '@/types/permissions'

// POST - Rejeitar post (volta para rascunho)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requirePermission(Permission.APPROVE_POST)

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'DRAFT',
        published: false,
      },
    })

    return NextResponse.json({
      post,
      message: 'Post rejeitado e retornado para rascunho',
    })
  } catch (error) {
    console.error('Erro ao rejeitar post:', error)
    const message = error instanceof Error ? error.message : 'Erro ao rejeitar post'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
