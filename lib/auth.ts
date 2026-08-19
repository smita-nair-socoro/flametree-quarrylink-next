import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash || !user.enabled || user.isDeleted) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            totalLogins: { increment: 1 },
          },
        });

        return {
          id: user.sub,
          email: user.email,
          name: user.name,
          role: user.role,
          fullName: user.fullName,
          tenantId: user.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role;
        token.fullName = (user as { fullName?: string }).fullName;
        token.tenantId = (user as { tenantId?: string }).tenantId;
      }

      if (process.env.NEXT_RUNTIME !== "edge") {
        const userSelect = {
          sub: true,
          status: true,
          role: true,
          fullName: true,
          tenantId: true,
        } as const;

        let dbUser = token.sub
          ? await prisma.user.findUnique({
              where: { sub: token.sub as string },
              select: userSelect,
            })
          : null;

        if (!dbUser && token.email) {
          dbUser = await prisma.user.findFirst({
            where: {
              email: { equals: token.email as string, mode: "insensitive" },
            },
            select: userSelect,
          });
          if (dbUser) {
            token.sub = dbUser.sub;
          }
        }

        if (dbUser) {
          token.role = dbUser.role;
          token.fullName = dbUser.fullName;
          token.tenantId = dbUser.tenantId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
        session.user.tenantId = token.tenantId as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/customer-operations") ||
        nextUrl.pathname.startsWith("/inventory") ||
        nextUrl.pathname.startsWith("/logistics") ||
        nextUrl.pathname.startsWith("/drivers-app") ||
        nextUrl.pathname.startsWith("/system") ||
        nextUrl.pathname.startsWith("/reporting") ||
        nextUrl.pathname.startsWith("/prototype") ||
        nextUrl.pathname.startsWith("/help-centre");

      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnProtected) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isOnLogin && isLoggedIn) {
        const role = auth.user?.role;
        const destination =
          role === "DRIVER" ? "/drivers-app" : "/dashboard";
        return Response.redirect(new URL(destination, nextUrl));
      }

      return true;
    },
  },
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
