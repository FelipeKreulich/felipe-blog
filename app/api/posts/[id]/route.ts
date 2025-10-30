import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// GET - Buscar post para edição
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem permissão para ver este post
    const isAuthor = post.authorId === session.user.id
    const isEditor = ['EDITOR', 'MODERATOR', 'ADMIN'].includes(session.user.role)

    if (!isAuthor && !isEditor) {
      return NextResponse.json(
        { error: 'Você não tem permissão para acessar este post' },
        { status: 403 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar post' },
      { status: 500 }
    )
  }
}

// PATCH - Editar post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar post atual
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const isAuthor = existingPost.authorId === session.user.id
    const isEditor = ['EDITOR', 'MODERATOR', 'ADMIN'].includes(session.user.role)

    if (!isAuthor && !isEditor) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este post' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      title,
      content,
      excerpt,
      coverImage,
      categoryIds,
      tags,
      published
    } = body

    // Validações
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Título não pode ser vazio' },
        { status: 400 }
      )
    }

    if (content !== undefined && (!content || content.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Conteúdo não pode ser vazio' },
        { status: 400 }
      )
    }

    // Preparar dados de atualização
    const updateData: any = {}

    if (title !== undefined) {
      updateData.title = title.trim()

      // Gerar novo slug se o título mudou
      if (title.trim() !== existingPost.title) {
        let slug = generateSlug(title)
        let slugExists = await prisma.post.findFirst({
          where: {
            slug,
            id: { not: id }
          }
        })
        let counter = 1

        while (slugExists) {
          slug = `${generateSlug(title)}-${counter}`
          slugExists = await prisma.post.findFirst({
            where: {
              slug,
              id: { not: id }
            }
          })
          counter++
        }

        updateData.slug = slug
      }
    }

    if (content !== undefined) updateData.content = content.trim()
    if (excerpt !== undefined) updateData.excerpt = excerpt?.trim() || null
    if (coverImage !== undefined) updateData.coverImage = coverImage || null

    // Atualizar status de publicação
    if (published !== undefined) {
      updateData.published = published
      if (published && !existingPost.published) {
        updateData.publishedAt = new Date()
      } else if (!published) {
        updateData.publishedAt = null
      }
    }

    // Atualizar categorias se fornecidas
    if (categoryIds !== undefined) {
      // Remover categorias antigas
      await prisma.postCategory.deleteMany({
        where: { postId: id }
      })

      // Adicionar novas categorias
      if (categoryIds.length > 0) {
        updateData.categories = {
          create: categoryIds.map((categoryId: string) => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        }
      }
    }

    // Atualizar tags se fornecidas
    if (tags !== undefined) {
      // Remover tags antigas
      await prisma.postTag.deleteMany({
        where: { postId: id }
      })

      // Adicionar novas tags
      if (tags.length > 0) {
        updateData.tags = {
          create: tags.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName.trim().toLowerCase() },
                create: {
                  name: tagName.trim().toLowerCase(),
                  slug: generateSlug(tagName.trim())
                }
              }
            }
          }))
        }
      }
    }

    // Atualizar post
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Erro ao editar post:', error)
    return NextResponse.json(
      { error: 'Erro ao editar post' },
      { status: 500 }
    )
  }
}
