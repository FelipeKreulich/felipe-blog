import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, '') // Remove hífens no início e fim
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário tem permissão para criar posts (WRITER ou acima)
    const allowedRoles = ['WRITER', 'EDITOR', 'MODERATOR', 'ADMIN']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para criar posts' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      title,
      content,
      excerpt,
      coverImage,
      categoryIds = [],
      tags = [],
      published = false
    } = body

    // Validações
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    // Gerar slug único
    let slug = generateSlug(title)
    let slugExists = await prisma.post.findUnique({ where: { slug } })
    let counter = 1

    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`
      slugExists = await prisma.post.findUnique({ where: { slug } })
      counter++
    }

    // Criar post
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        coverImage: coverImage || null,
        published,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        },
        tags: {
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
      },
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

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar post:', error)
    return NextResponse.json(
      { error: 'Erro ao criar post' },
      { status: 500 }
    )
  }
}
