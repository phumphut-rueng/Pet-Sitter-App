import NextAuth, { type NextAuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/prisma/prisma";

type UserWithRoles = User & { roles?: string[] };

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { user_role: { include: { role: true } } },
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
    async signIn({ user, account, profile }) {
      // ถ้าเป็น OAuth provider (Google, Facebook)
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          // ตรวจสอบว่ามี user ในระบบหรือยัง
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { user_role: { include: { role: true } } },
          });

          // ถ้ายังไม่มี user ให้สร้างใหม่
          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                profile_image: user.image,
                password: "", // OAuth users ไม่ต้องใช้ password
                status: "normal",
                approval_status_id: 1,
              },
            });

            // สร้าง Account record เพื่อเชื่อมกับ OAuth provider
            await prisma.account.create({
              data: {
                userId: newUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });

            // กำหนด role เริ่มต้น (role_id = 2 สำหรับ Owner)
            // ถ้ามี role parameter ใน URL ให้ใช้ role นั้น
            await prisma.user_role.create({
              data: {
                user_id: newUser.id,
                role_id: 2, // Default: Owner (role_id = 2)
              },
            });
          } else {
            // ถ้ามี user แล้ว ให้อัพเดท Account ถ้ายังไม่มี
            const existingAccount = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
            });

            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
            }
          }

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },

    // เก็บ roles ลง JWT ตอน sign-in และ sync ตอน session.update()
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: JWT;
      user?: User | undefined;
      trigger?: "signIn" | "update" | "signUp" | undefined;
    }): Promise<JWT> {
      // กรณี sign-in ครั้งแรก
      if (user && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { user_role: { include: { role: true } } },
          });

          if (dbUser) {
            token.sub = dbUser.id.toString();
            token.roles = dbUser.user_role.map(
              (ur: { role: { role_name: string } }) => ur.role.role_name
            );
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = dbUser.profile_image;
          }
        } catch (error) {
          console.error("Error fetching user roles:", error);
        }
      }

      const u = user as UserWithRoles | undefined;
      if (u?.roles) token.roles = u.roles;

      if (trigger === "update" && token.sub) {
        try {
          const userId = parseInt(token.sub);
          if (Number.isNaN(userId)) return token;

          const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { user_role: { include: { role: true } } },
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

    // ✅ default redirect หลังล็อกอิน (เมื่อไม่มี callbackUrl)
    async redirect({ url, baseUrl }) {
      // มี callbackUrl แบบ internal → ตามนั้นก่อน
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // อยู่โดเมนเดียวกัน → ตามนั้น
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch { /* ignore */ }
      // ไม่มี callbackUrl → ไป /admin
      return `${baseUrl}/admin`;
    },
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/login",
  },

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);