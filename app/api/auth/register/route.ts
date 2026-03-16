import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signUpSchema } from '@/lib/validations/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 registrations per IP per 15 minutes
    const ip = getClientIp(req)
    const rl = rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 900 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente mais tarde.' },
        { status: 429 }
      )
    }

    const body = await req.json()

    // Validação com Zod
    const result = signUpSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.errors[0]?.message || 'Dados inválidos'
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      )
    }

    const { email, password, name, username } = result.data

    // Verificar se o email já existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // Verificar se o username já existe
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Este nome de usuário já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
        role: 'USER'
      }
    })

    // Retornar sucesso (sem a senha)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}
