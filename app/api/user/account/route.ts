import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Deletar avatar do servidor se existir
    if (user.avatar) {
      const avatarPath = user.avatar.replace('/storage/avatars/', '')
      const filepath = join(process.cwd(), 'public', 'storage', 'avatars', avatarPath)

      if (existsSync(filepath)) {
        try {
          await unlink(filepath)
        } catch (error) {
          console.error('Erro ao deletar avatar:', error)
        }
      }
    }

    // Deletar usuário (isso deve deletar em cascata posts, comentários, etc)
    await prisma.user.delete({
      where: { id: session.user.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Conta excluída com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir conta' },
      { status: 500 }
    )
  }
}
