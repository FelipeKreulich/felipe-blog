import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const postId = id

    // Verificar se o post existe e pertence ao usuário
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para deletar este post' },
        { status: 403 }
      )
    }

    // Deletar o post (cascata deleta relacionamentos)
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({
      success: true,
      message: 'Post deletado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar post:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const postId = id
    const body = await req.json()
    const { action } = body // 'publish', 'unpublish', 'feature', 'unfeature'

    // Verificar se o post existe e pertence ao usuário
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este post' },
        { status: 403 }
      )
    }

    // Atualizar o post baseado na ação
    let updateData: any = {}

    if (action === 'publish') {
      updateData = {
        published: true,
        publishedAt: new Date()
      }
    } else if (action === 'unpublish') {
      updateData = {
        published: false,
        publishedAt: null
      }
    } else if (action === 'feature') {
      updateData = {
        feature: true
      }
    } else if (action === 'unfeature') {
      updateData = {
        feature: false
      }
    } else {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      )
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      post: updatedPost
    })
  } catch (error) {
    console.error('Erro ao atualizar post:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar post' },
      { status: 500 }
    )
  }
}
