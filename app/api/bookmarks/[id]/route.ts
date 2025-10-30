import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/bookmarks/[id]
 *
 * Busca um bookmark específico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              }
            },
            categories: {
              include: {
                category: true
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              }
            }
          }
        }
      }
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ bookmark })
  } catch (error) {
    console.error('Erro ao buscar bookmark:', error)
    const message = error instanceof Error ? error.message : 'Erro ao buscar bookmark'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

/**
 * PATCH /api/bookmarks/[id]
 *
 * Atualiza a nota de um bookmark
 *
 * Body:
 * - note: Nova nota pessoal
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const { note } = await req.json()

    // Verificar se o bookmark existe e pertence ao usuário
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId: user.id,
      }
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar bookmark
    const updated = await prisma.bookmark.update({
      where: { id },
      data: {
        note: note || null,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      }
    })

    return NextResponse.json({ bookmark: updated })
  } catch (error) {
    console.error('Erro ao atualizar bookmark:', error)
    const message = error instanceof Error ? error.message : 'Erro ao atualizar bookmark'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

/**
 * DELETE /api/bookmarks/[id]
 *
 * Remove um bookmark
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()

    // Verificar se o bookmark existe e pertence ao usuário
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId: user.id,
      }
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark não encontrado' },
        { status: 404 }
      )
    }

    // Deletar bookmark
    await prisma.bookmark.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Bookmark removido com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar bookmark:', error)
    const message = error instanceof Error ? error.message : 'Erro ao deletar bookmark'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
