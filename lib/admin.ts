import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Hash do admin - deve ser configurada em .env
const ADMIN_HASH = process.env.ADMIN_HASH || 'default-admin-hash-change-me'

export async function validateAdminAccess(hash: string | null) {
  // Verificar hash
  if (!hash || hash !== ADMIN_HASH) {
    return {
      valid: false,
      error: 'Hash inválida'
    }
  }

  // Verificar sessão
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      valid: false,
      error: 'Não autenticado'
    }
  }

  // Verificar role ADMIN
  if (session.user.role !== 'ADMIN') {
    return {
      valid: false,
      error: 'Acesso negado - você não é um administrador'
    }
  }

  return {
    valid: true,
    user: session.user
  }
}
