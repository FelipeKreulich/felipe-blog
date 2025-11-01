import { NextRequest, NextResponse } from 'next/server'
import { canEditPost } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { sanitizeHtml, sanitizeText, extractPlainText } from '@/lib/sanitize'

// PATCH - Editar post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const canEdit = await canEditPost(id)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este post' },
        { status: 403 }
      )
    }

    const { title, content, excerpt, coverImage, categoryIds, tagIds } = await req.json()

    // Sanitizar dados de entrada
    const sanitizedTitle = title ? sanitizeText(title) : undefined
    const sanitizedContent = content ? sanitizeHtml(content) : undefined
    const sanitizedExcerpt = excerpt !== undefined
      ? (excerpt ? sanitizeText(excerpt) : null)
      : undefined

    // Se excerpt não foi fornecido mas content foi, gerar automaticamente
    const finalExcerpt = sanitizedExcerpt !== undefined
      ? sanitizedExcerpt
      : (sanitizedContent ? extractPlainText(sanitizedContent, 160) : undefined)

    // Buscar post atual para verificar se slug precisa ser atualizado
    const currentPost = await prisma.post.findUnique({
      where: { id },
      select: { title: true, slug: true },
    })

    let slug = currentPost?.slug

    // Se o título mudou, gerar novo slug
    if (sanitizedTitle && sanitizedTitle !== currentPost?.title) {
      const baseSlug = sanitizedTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      slug = baseSlug
      let counter = 1

      while (await prisma.post.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Atualizar post
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(sanitizedTitle && { title: sanitizedTitle }),
        ...(slug !== currentPost?.slug && { slug }),
        ...(sanitizedContent && { content: sanitizedContent }),
        ...(finalExcerpt !== undefined && { excerpt: finalExcerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(categoryIds && {
          categories: {
            deleteMany: {},
            create: categoryIds.map((catId: string) => ({
              categoryId: catId,
            })),
          },
        }),
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId: string) => ({
              tagId: tagId,
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Erro ao editar post:', error)
    const message = error instanceof Error ? error.message : 'Erro ao editar post'
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('permissão') ? 403 : 500 }
    )
  }
}
