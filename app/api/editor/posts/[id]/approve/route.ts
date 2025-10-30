import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Permission } from '@/types/permissions'

// POST - Aprovar post e publicar
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
        status: 'PUBLISHED',
        published: true,
        publishedAt: new Date(),
      },
    })

    return NextResponse.json({
      post,
      message: 'Post aprovado e publicado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao aprovar post:', error)
    const message = error instanceof Error ? error.message : 'Erro ao aprovar post'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
