/**
 * Cache and Revalidation utilities for ISR (Incremental Static Regeneration)
 */

// Revalidation times em segundos
export const REVALIDATE_TIMES = {
  // Páginas estáticas que mudam raramente
  STATIC: 86400, // 24 horas

  // Homepage e listagens
  HOME: 3600, // 1 hora
  BLOG_LIST: 1800, // 30 minutos

  // Posts individuais
  POST: 3600, // 1 hora

  // Perfis de usuário
  PROFILE: 7200, // 2 horas

  // Categorias e tags
  CATEGORIES: 3600, // 1 hora

  // Analytics e stats
  STATS: 300, // 5 minutos

  // Newsletter
  NEWSLETTER: 3600, // 1 hora
} as const

/**
 * Invalida cache de uma rota específica
 * Usar em mutations (create, update, delete)
 */
export async function revalidatePath(path: string) {
  try {
    const response = await fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, {
      method: 'POST',
    })
    return response.ok
  } catch (error) {
    console.error('Failed to revalidate:', error)
    return false
  }
}

/**
 * Invalida cache de múltiplas rotas
 */
export async function revalidatePaths(paths: string[]) {
  const results = await Promise.all(paths.map((path) => revalidatePath(path)))
  return results.every((result) => result)
}

/**
 * Invalida cache após criar/atualizar/deletar post
 */
export async function revalidatePost(slug: string) {
  return revalidatePaths([
    '/',
    '/blog',
    `/blog/${slug}`,
  ])
}

/**
 * Invalida cache após criar/atualizar/deletar categoria
 */
export async function revalidateCategory(slug: string) {
  return revalidatePaths([
    '/blog',
    `/blog?category=${slug}`,
  ])
}

/**
 * Invalida cache após atualizar perfil
 */
export async function revalidateProfile(username: string) {
  return revalidatePaths([
    `/profile/${username}`,
  ])
}
