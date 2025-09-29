import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";

function hasRole(token: JWT | null | undefined, role: string): boolean {
  const roles: string[] = Array.isArray(token?.roles) ? (token!.roles as string[]) : [];
  return roles.includes(role);
}

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth?.token as JWT | null;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/sitter") && !hasRole(token, "Sitter")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/user") && !hasRole(token, "Owner")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);


export const config = {
  matcher: ["/sitter/:path*", "/account/:path*"],
};