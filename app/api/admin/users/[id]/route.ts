import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminAccess } from '@/lib/admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Role é obrigatória' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const hash = searchParams.get('hash')

    const validation = await validateAdminAccess(hash)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      )
    }

    // Não permitir deletar o próprio usuário
    if (id === validation.user?.id) {
      return NextResponse.json(
        { error: 'Você não pode deletar sua própria conta' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar usuário' },
      { status: 500 }
    )
  }
}
