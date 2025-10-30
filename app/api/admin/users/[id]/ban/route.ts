import { NextRequest, NextResponse } from 'next/server'
import { requireRole, requireAnyPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { Permission } from '@/types/permissions'

// POST - Banir/Suspender usuário
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await requireAnyPermission([Permission.BAN_USER, Permission.SUSPEND_USER])
    const { reason, permanent, days } = await req.json()

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Motivo é obrigatório' },
        { status: 400 }
      )
    }

    // Apenas ADMIN pode banir permanentemente
    if (permanent && currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Apenas administradores podem banir permanentemente' },
        { status: 403 }
      )
    }

    // Não pode banir a si mesmo
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: 'Você não pode banir a si mesmo' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Não pode banir ADMIN
    if (targetUser.role === Role.ADMIN) {
      return NextResponse.json(
        { error: 'Não é possível banir um administrador' },
        { status: 403 }
      )
    }

    const bannedUntil = permanent ? null : (days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

    // Atualizar usuário
    await prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        bannedUntil,
        banReason: reason,
      },
    })

    // Criar registro de ban
    await prisma.userBan.create({
      data: {
        userId: id,
        bannedById: currentUser.id,
        reason,
        permanent,
        expiresAt: bannedUntil,
      },
    })

    return NextResponse.json({
      message: permanent ? 'Usuário banido permanentemente' : 'Usuário suspenso temporariamente',
    })
  } catch (error) {
    console.error('Erro ao banir usuário:', error)
    const message = error instanceof Error ? error.message : 'Erro ao banir usuário'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

// DELETE - Desbanir usuário
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireRole([Role.ADMIN, Role.MODERATOR])

    await prisma.user.update({
      where: { id },
      data: {
        isBanned: false,
        bannedUntil: null,
        banReason: null,
      },
    })

    return NextResponse.json({
      message: 'Usuário desbanido com sucesso',
    })
  } catch (error) {
    console.error('Erro ao desbanir usuário:', error)
    const message = error instanceof Error ? error.message : 'Erro ao desbanir usuário'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
