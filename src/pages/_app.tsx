import 'leaflet/dist/leaflet.css';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar/Navbar";
import { SocketProvider } from "@/components/chat/SocketProvider";

const NAV_HIDE_ROUTES = new Set([
  "/login",
  "/logout",
  // ถ้าต้องการเพิ่ม: "/register", "/auth/forgot-password"
]);

const NAV_HIDE_PREFIXES = [
  "/auth", // ครอบพวก /auth/login, /auth/reset ฯลฯ
  "/admin",
  "/admin-management",
  "/admin-panel",
  "/sitter",
  "/sitters",
  "/petsitter",
  "/pet-sitter",
  "/pet-sitter-management",
] as const;

function normalize(pathname: string) {
  return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
}

function shouldHideNavbar(pathname: string): boolean {
  const p = normalize(pathname);

  // 1) ซ่อนถ้าเป็นหน้าเฉพาะแบบตรงตัว (login/logout)
  if (NAV_HIDE_ROUTES.has(p)) return true;

  // 2) ซ่อนถ้าขึ้นต้นด้วย prefix ที่กำหนด
  return NAV_HIDE_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const { pathname } = useRouter();
  const showNavbar = !shouldHideNavbar(pathname);

  return (
    <SessionProvider session={session}>
      <SocketProvider>
        {showNavbar && <Navbar />}
        <Component {...pageProps} />
      </SocketProvider>
    </SessionProvider>
  );
}