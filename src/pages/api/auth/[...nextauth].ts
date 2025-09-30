import NextAuth, { type NextAuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { JWT } from "next-auth/jwt";

type UserWithRoles = User & { roles?: string[] };

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              user_role: { include: { role: true } },
            },
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          const roles = user.user_role.map(
            (ur: { role: { role_name: string } }) => ur.role.role_name
          );

          const result: UserWithRoles = {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.profile_image || undefined,
            roles,
          };

          return result;
        } catch {
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 วัน
  },

  callbacks: {
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: JWT;
      user?: User | undefined;
      trigger?: "signIn" | "update" | "signUp" | undefined;
    }): Promise<JWT> {
      // หลัง sign-in: ดึง roles จาก user → token
      const u = user as UserWithRoles | undefined;
      if (u?.roles) {
        token.roles = u.roles;
      }

      // รองรับ session.update()
      if (trigger === "update" && token.sub) {
        try {
          const userId = parseInt(token.sub);
          if (Number.isNaN(userId)) return token;

          const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              user_role: { include: { role: true } },
            },
          });

          if (updatedUser) {
            token.name = updatedUser.name ?? token.name;
            token.email = updatedUser.email ?? token.email;
            token.picture = updatedUser.profile_image ?? token.picture;
            token.roles = updatedUser.user_role.map(
              (ur: { role: { role_name: string } }) => ur.role.role_name
            );
          }
        } catch {
          return token;
        }
      }

      return token;
    },

    async session({
      session,
      token,
    }: {
      session: import("next-auth").Session;
      token: JWT;
    }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.name = token.name || "";
        session.user.email = token.email || "";
        session.user.image = (token.picture as string | undefined) || undefined;
        session.user.roles = (token.roles as string[]) || [];
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/",        // ออกจากระบบ  หน้าแรก
    error: "/auth/login" // error  กลับหน้า login
  },

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);