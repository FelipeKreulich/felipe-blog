import { z } from 'zod'

// Schema para atualizar perfil
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .optional(),
  username: z
    .string()
    .min(3, 'O nome de usuário deve ter no mínimo 3 caracteres')
    .max(30, 'O nome de usuário deve ter no máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nome de usuário deve conter apenas letras, números, hífens e underscores')
    .optional(),
  bio: z
    .string()
    .max(500, 'A bio deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
})

// Schema para alterar senha
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve ter no mínimo 6 caracteres')
    .max(100, 'A nova senha deve ter no máximo 100 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
