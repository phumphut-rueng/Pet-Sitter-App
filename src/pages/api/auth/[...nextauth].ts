import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

          console.log('🔍 User found during login:', {
            id: user.id,
            email: user.email,
            roles: roles
          })

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.profile_image || undefined,
            roles: roles
          }
        } catch (error) {
          console.error('Authentication error:', error)
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
        console.log('🔍 JWT callback - storing roles in token:', {
          userId: user.id,
          roles: user.roles
        })
        
      }
      console.log("JWT Token", token);

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
          console.error('Error updating token:', error)
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