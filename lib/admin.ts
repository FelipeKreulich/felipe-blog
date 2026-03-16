import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function validateAdminAccess(hash?: string | null) {
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
