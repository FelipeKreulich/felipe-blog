import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminAccess } from '@/lib/admin'

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

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
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
    const { action } = body

    let updateData: any = {}

    if (action === 'publish') {
      updateData = { published: true, publishedAt: new Date() }
    } else if (action === 'unpublish') {
      updateData = { published: false, publishedAt: null }
    } else if (action === 'feature') {
      updateData = { feature: true }
    } else if (action === 'unfeature') {
      updateData = { feature: false }
    } else {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      )
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Erro ao atualizar post:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar post' },
      { status: 500 }
    )
  }
}
