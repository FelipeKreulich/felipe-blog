import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminAccess } from '@/lib/admin'

/**
 * GET /api/admin/newsletter/stats
 *
 * Retorna estatísticas sobre inscritos da newsletter
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hash = searchParams.get('hash')

    // Validar acesso admin
    const validation = await validateAdminAccess(hash)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      )
    }

    // Contar inscritos
    const [total, active, inactive, byLanguage] = await Promise.all([
      prisma.newsletter.count(),
      prisma.newsletter.count({ where: { isActive: true } }),
      prisma.newsletter.count({ where: { isActive: false } }),
      prisma.newsletter.groupBy({
        by: ['language'],
        where: { isActive: true },
        _count: true,
      }),
    ])

    return NextResponse.json({
      total: active, // Apenas ativos para o componente
      totalAll: total,
      active,
      inactive,
      byLanguage: byLanguage.reduce((acc, item) => {
        acc[item.language] = item._count
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
