import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Permission } from '@/types/permissions'

// POST - Publicar post (Editor, Moderator, Admin)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requirePermission(Permission.PUBLISH_POST)

    const post = await prisma.post.update({
      where: { id },
      data: {
        published: true,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })

    return NextResponse.json({
      post,
      message: 'Post publicado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao publicar post:', error)
    const message = error instanceof Error ? error.message : 'Erro ao publicar post'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

// DELETE - Despublicar post (Editor, Moderator, Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requirePermission(Permission.PUBLISH_POST)

    const post = await prisma.post.update({
      where: { id },
      data: {
        published: false,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({
      post,
      message: 'Post despublicado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao despublicar post:', error)
    const message = error instanceof Error ? error.message : 'Erro ao despublicar post'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
