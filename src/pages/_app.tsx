import 'leaflet/dist/leaflet.css';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/navbar/Navbar";
import { SocketProvider } from "@/components/chat/SocketProvider";
import MessageNotification from "@/components/chat/MessageNotification";
import PageToaster from "@/components/ui/PageToaster";
import { satoshi, notoThai } from "@/fonts"; 

const NAV_HIDE_ROUTES = new Set([
  "/login",
  "/logout",
]);

const NAV_HIDE_PREFIXES = [
  "/auth",
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
  if (NAV_HIDE_ROUTES.has(p)) return true;
  return NAV_HIDE_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const { pathname } = useRouter();
  const showNavbar = !shouldHideNavbar(pathname);

  return (
    <SessionProvider session={session}>
      <SocketProvider>
        {/* เพิ่ม font variables ที่ wrapper div */}
        <div className={`${satoshi.variable} ${notoThai.variable}`}>
          {showNavbar && <Navbar />}
          <Component {...pageProps} />
          
          {/* Global Toaster  ใช้ className จาก globals.css */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: '',
              success: {
                className: 'toast-success',
              },
              error: {
                className: 'toast-error',
              },
              loading: {
                className: 'toast-loading',
              },
            }}
          />
          {/* แสดง notification เมื่อมีข้อความใหม่ */}
          <MessageNotification />
          {/* เพิ่ม PageToaster เพื่อให้ toast แสดงได้ทั่วทั้งแอป */}
          <PageToaster />
        </div>
      </SocketProvider>
    </SessionProvider>
  );
}