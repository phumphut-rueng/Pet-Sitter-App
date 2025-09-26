// middleware.ts - จัดการการเข้าถึงเส้นทางตามบทบาทของผู้ใช้
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;


    // ตรวจสอบการเข้าถึงเส้นทาง /sitter
    if (path.startsWith("/sitter")) {
      if (!token?.roles?.includes("Sitter")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // ตรวจสอบการเข้าถึงเส้นทาง /user
    if (path.startsWith("/user")) {
      if (!token?.roles?.includes("Owner")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next(); // อนุญาตให้ผ่านไปยังขั้นตอนถัดไป
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // อนุญาตการเข้าถึงเสมอ - จัดการการเปลี่ยนเส้นทางในฟังก์ชัน middleware
        return true;
      },
    },
  }
);

// จำกัด middleware ให้ทำงานเฉพาะเส้นทางที่กำหนด
export const config = {
  matcher: ["/sitter/:path*", "/account/:path*"],
};
