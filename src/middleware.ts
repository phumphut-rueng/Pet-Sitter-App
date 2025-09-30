import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";
import { routeRules } from "@/lib/auth/route-rules";
import { normalizeRole, type Role } from "@/lib/auth/roles";

type AppJWT = JWT & { roles?: string[] };

const PUBLIC_PATHS: readonly string[] = [
  "/", "/auth/login", "/auth/register", "/auth/forgot-password",
  "/api/auth", "/favicon.ico", "/images", "/icons", "/_next", "/static",
];

function isPublic(pathname: string): boolean {
  const p = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  return PUBLIC_PATHS.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1) Canonical redirect
  if (pathname.startsWith("/pet-sitter")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/pet-sitter/, "/sitter");
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  // 2) public  ผ่าน
  if (isPublic(pathname)) return NextResponse.next();

  // 3) อ่านโทเคน NextAuth (ต้องมี SECRET เดียวกับ NextAuth)
  const token = (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) as AppJWT | null;
  if (!token) {
    const login = new URL("/auth/login", req.url);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  // 4) map roles  Role[]
  const roles: Role[] = (token.roles ?? [])
    .map(normalizeRole)
    .filter((r): r is Role => r !== null);

  // 5) หา rule
  const rule = routeRules.find((r) => r.pattern.test(pathname));
  if (!rule) return NextResponse.next();

  // 6) ตรวจสิทธิ์ (กำหนดอะไรไว้ ต้องผ่านอันนั้น)
  let allowed = true;
  if (rule.anyOf) allowed &&= rule.anyOf.some((r) => roles.includes(r));
  if (rule.allOf) allowed &&= rule.allOf.every((r) => roles.includes(r));

  if (!allowed) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

// จับทุก path ยกเว้นไฟล์และ _next
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };