import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

// PATCH - Atualizar role de um usuário
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await requireRole(Role.ADMIN)
    const { role } = await req.json()

    // Validar role
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: 'Role inválida' },
        { status: 400 }
      )
    }

    // Não pode alterar própria role
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: 'Você não pode alterar sua própria role' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro ao atualizar role:', error)
    const message = error instanceof Error ? error.message : 'Erro ao atualizar role'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
