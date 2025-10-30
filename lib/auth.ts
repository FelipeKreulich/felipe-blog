import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          username: user.username,
          image: user.avatar
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Se for um novo login, pegar dados do user
      if (user) {
        token.role = user.role
        token.username = user.username
        token.picture = user.image
      }
      // Se NÃO for novo login, sempre buscar dados atualizados do banco
      else if (token.sub) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            name: true,
            avatar: true,
            username: true,
            role: true,
            email: true
          }
        })

        if (updatedUser) {
          token.name = updatedUser.name
          token.picture = updatedUser.avatar
          token.username = updatedUser.username
          token.role = updatedUser.role
          token.email = updatedUser.email
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.image = token.picture as string | null
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
}