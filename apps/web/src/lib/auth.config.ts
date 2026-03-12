import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    session({ session, token }) {
      if (token.workspaceId) {
        (session.user as { workspaceId?: string }).workspaceId = token.workspaceId as string;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.workspaceId = (user as { workspaceId?: string }).workspaceId;
      }
      return token;
    },
  },
  providers: [],
};
