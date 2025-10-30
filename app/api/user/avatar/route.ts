import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP' },
        { status: 400 }
      )
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.type.split('/')[1]
    const filename = `${session.user.id}-${timestamp}-${randomString}.${extension}`

    // Caminho para salvar o arquivo
    const filepath = join(process.cwd(), 'public', 'storage', 'avatars', filename)

    // Salvar arquivo
    await writeFile(filepath, buffer)

    // Buscar usuário para obter avatar antigo
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // Deletar avatar antigo se existir
    if (user?.avatar) {
      const oldAvatarPath = user.avatar.replace('/storage/avatars/', '')
      const oldFilepath = join(process.cwd(), 'public', 'storage', 'avatars', oldAvatarPath)

      if (existsSync(oldFilepath)) {
        try {
          await unlink(oldFilepath)
        } catch (error) {
          console.error('Erro ao deletar avatar antigo:', error)
        }
      }
    }

    // Atualizar URL do avatar no banco
    const avatarUrl = `/storage/avatars/${filename}`
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl }
    })

    return NextResponse.json({
      success: true,
      avatarUrl
    })
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do avatar' },
      { status: 500 }
    )
  }
}

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

    if (!user?.avatar) {
      return NextResponse.json(
        { error: 'Nenhum avatar para remover' },
        { status: 400 }
      )
    }

    // Deletar arquivo
    const avatarPath = user.avatar.replace('/storage/avatars/', '')
    const filepath = join(process.cwd(), 'public', 'storage', 'avatars', avatarPath)

    if (existsSync(filepath)) {
      try {
        await unlink(filepath)
      } catch (error) {
        console.error('Erro ao deletar avatar:', error)
      }
    }

    // Remover avatar do banco
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Erro ao remover avatar:', error)
    return NextResponse.json(
      { error: 'Erro ao remover avatar' },
      { status: 500 }
    )
  }
}
