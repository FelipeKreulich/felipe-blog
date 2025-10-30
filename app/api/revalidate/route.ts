import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath as nextRevalidatePath } from 'next/cache'

/**
 * API Route para revalidação on-demand de cache
 *
 * POST /api/revalidate?path=/blog&secret=YOUR_SECRET
 *
 * Uso:
 * - Após criar/editar/deletar posts
 * - Após atualizar categorias
 * - Após modificar perfis
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const secret = searchParams.get('secret')

    // Validar secret (opcional, mas recomendado)
    const revalidateSecret = process.env.REVALIDATE_SECRET
    if (revalidateSecret && secret !== revalidateSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    // Validar path
    if (!path) {
      return NextResponse.json(
        { error: 'Missing path parameter' },
        { status: 400 }
      )
    }

    // Revalidar o path
    nextRevalidatePath(path)

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Error revalidating', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Também permitir GET para testes
export async function GET(request: NextRequest) {
  return POST(request)
}
