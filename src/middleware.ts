import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// หน้า public ที่ให้เข้าตรงๆ ได้
const PUBLIC_PREFIXES = ["/", "/auth", "/api/auth", "/_next", "/icons", "/images", "/favicon.ico", "/static"];

function isPublic(pathname: string) {
  const p = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  return PUBLIC_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ผ่านหน้า public
  if (isPublic(pathname)) return NextResponse.next();

  // บังคับ login เฉพาะโซน sitter
  if (pathname.startsWith("/sitter")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const login = req.nextUrl.clone();
      login.pathname = "/auth/login";
      login.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

// จับทุก path ยกเว้นไฟล์และ _next static
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };