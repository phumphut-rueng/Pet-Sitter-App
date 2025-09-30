import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar/Navbar";

const NAV_HIDE_PREFIXES = [
  "/admin", 
  "/admin-management", 
  "/admin-panel",
  "/sitter", 
  "/sitters", 
  "/petsitter", 
  "/pet-sitter", 
  "/pet-sitter-management",
] as const;

function shouldHideNavbar(pathname: string): boolean {
  const p = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  return NAV_HIDE_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const { pathname } = useRouter();
  const showNavbar = !shouldHideNavbar(pathname);

  return (
    <SessionProvider session={session}>
      {showNavbar && <Navbar />}
      <Component {...pageProps} />
    </SessionProvider>
  );
}