import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminAccess } from '@/lib/admin'
import { LogLevel } from '@/lib/generated/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hash = searchParams.get('hash')

    const validation = await validateAdminAccess(hash)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      )
    }

    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    const where: any = {}

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (level && Object.values(LogLevel).includes(level as LogLevel)) {
      where.level = level
    }

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.log.count({ where })
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar logs' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hash = searchParams.get('hash')

    const validation = await validateAdminAccess(hash)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { deleteAll, level, olderThan } = body

    let where: any = {}

    if (deleteAll) {
      // Deletar todos os logs
      where = {}
    } else {
      // Deletar logs específicos
      if (level && Object.values(LogLevel).includes(level as LogLevel)) {
        where.level = level
      }

      if (olderThan) {
        where.createdAt = {
          lt: new Date(olderThan)
        }
      }
    }

    const result = await prisma.log.deleteMany({ where })

    return NextResponse.json({
      success: true,
      deletedCount: result.count
    })
  } catch (error) {
    console.error('Erro ao deletar logs:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar logs' },
      { status: 500 }
    )
  }
}
