import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";


const PUBLIC_PREFIXES = [
  "/",
  "/auth",
  "/api/auth",
  "/_next",
  "/icons",
  "/images",
  "/favicon.ico",
  "/static",
  "/componentall",
];

function isPublic(pathname: string) {
  const p = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  return PUBLIC_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const roles = ((token?.roles as string[]) || []).map((r) => r.toLowerCase());


  if (token && roles.includes("admin") && pathname === "/auth/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // ผ่านหน้า public ได้เลย
  if (isPublic(pathname)) return NextResponse.next();

  // โซน /admin: ต้องเป็นแอดมินเท่านั้น
  if (pathname.startsWith("/admin")) {
    // ยังไม่ล็อกอิน  ส่งไปหน้า login พร้อม callback
    if (!token) {
      const login = req.nextUrl.clone();
      login.pathname = "/auth/login";
      login.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(login);
    }
    // ล็อกอินแล้วแต่ไม่ใช่แอดมิน  เด้งกลับหน้าแรก
    if (!roles.includes("admin")) {
      const home = req.nextUrl.clone();
      home.pathname = "/";
      return NextResponse.redirect(home);
    }
  }

  // /admin root  ส่งเข้าหน้ารายการ owner
  if (pathname === "/admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/owner";
    return NextResponse.redirect(url);
  }

  //  โซน /sitter: ต้องล็อกอิน
  if (pathname.startsWith("/sitter") && !token) {
    const login = req.nextUrl.clone();
    login.pathname = "/auth/login";
    login.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  // โซน /chat: ต้องล็อกอิน
  if (pathname.startsWith("/chat") && !token) {
    const login = req.nextUrl.clone();
    login.pathname = "/auth/login";
    login.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

// จับทุก path ยกเว้นไฟล์และ _next static
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };