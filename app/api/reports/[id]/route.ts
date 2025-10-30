import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Permission } from '@/types/permissions'

// PATCH - Atualizar status do report
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requirePermission(Permission.RESOLVE_REPORTS)
    const { status } = await req.json()

    const validStatuses = ['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Erro ao atualizar report:', error)
    const message = error instanceof Error ? error.message : 'Erro ao atualizar report'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}

// DELETE - Deletar report
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requirePermission(Permission.RESOLVE_REPORTS)

    await prisma.report.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Report deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar report:', error)
    const message = error instanceof Error ? error.message : 'Erro ao deletar report'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
