import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              user_role: {
                include: { role: true }
              }
            }
          })

          if (!user) {
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            return null
          }

          const roles = user.user_role.map(ur => ur.role.role_name)

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.profile_image || undefined,
            roles: roles
          }
        } catch (error) {
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.roles = user.roles
      }

      // Handle session updates (when update() is called)
      if (trigger === 'update' && token.sub) {
        try {
          const updatedUser = await prisma.user.findUnique({
            where: { id: parseInt(token.sub) },
            include: {
              user_role: {
                include: { role: true }
              }
            }
          })

          if (updatedUser) {
            token.name = updatedUser.name
            token.email = updatedUser.email
            token.picture = updatedUser.profile_image
            token.roles = updatedUser.user_role.map(ur => ur.role.role_name)
          }
        } catch (error) {
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ''
        session.user.name = token.name || ''
        session.user.email = token.email || ''
        session.user.image = token.picture || undefined
        session.user.roles = (token.roles as string[]) || []
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/', // Redirect to homepage after logout
    error: '/auth/login' // Redirect errors back to login page
  },
  debug: process.env.NODE_ENV === 'development'
}

export default NextAuth(authOptions)