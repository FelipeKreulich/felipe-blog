import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requirePermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Permission } from '@/types/permissions'

// GET - Listar reports (Moderador/Admin)
export async function GET(req: NextRequest) {
  try {
    await requirePermission(Permission.VIEW_REPORTS)

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    const where = {
      ...(status && { status: status as any }),
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.report.count({ where }),
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao listar reports:', error)
    const message = error instanceof Error ? error.message : 'Erro ao listar reports'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

// POST - Criar report (Qualquer usuário autenticado)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { reason, details, postId, commentId } = await req.json()

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Motivo é obrigatório' },
        { status: 400 }
      )
    }

    if (!postId && !commentId) {
      return NextResponse.json(
        { error: 'Você deve reportar um post ou comentário' },
        { status: 400 }
      )
    }

    const report = await prisma.report.create({
      data: {
        reason,
        details: details || null,
        reporterId: user.id,
        postId: postId || null,
        commentId: commentId || null,
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar report:', error)
    const message = error instanceof Error ? error.message : 'Erro ao criar report'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
