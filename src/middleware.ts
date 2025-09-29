// src/middleware.ts
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";
import { routeRules, hasAny, hasAll, type Role } from "@/server/roles";

function getRoles(token: JWT | null | undefined): string[] {
  return Array.isArray(token?.roles) ? (token.roles as string[]) : [];
}

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth?.token as JWT | null;
    const userRoles = getRoles(token);
    const path = req.nextUrl.pathname;

    // เลือก prefix ที่ยาวสุดก่อน → /account/profile ชนะ /account
    const matched = Object.keys(routeRules)
      .sort((a, b) => b.length - a.length)
      .find((p) => path.startsWith(p));

    // (debug ชั่วคราว)
    // console.log("[MW]", { path, userRoles, matched });

    if (matched) {
      const rule = routeRules[matched]!;
      if (rule.allOf && !hasAll(userRoles, rule.allOf as Role[])) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      if (rule.anyOf && !hasAny(userRoles, rule.anyOf as Role[])) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // ต้องมี token ถึงจะเข้ามาถึงขั้นตรวจบทบาท
      authorized: ({ token }) => !!token,
    },
  }
);

// ให้ middleware รันบน /account/* และ /sitter/* (ส่วนกฎละเอียดอยู่ใน routeRules)
export const config = {
  matcher: ["/account/:path*", "/sitter/:path*"],
  // ถ้าพร้อมคุม /user/* หรือ /admin/* ก็เพิ่มได้ภายหลัง:
  // matcher: ["/account/:path*", "/sitter/:path*", "/user/:path*", "/admin/:path*"],
};