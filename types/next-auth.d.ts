import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      fullName: string;
      tenantId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    fullName?: string;
    tenantId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role?: string;
    fullName?: string;
    tenantId?: string;
  }
}
