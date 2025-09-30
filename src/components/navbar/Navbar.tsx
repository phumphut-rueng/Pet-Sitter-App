import React, { useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import type { DefaultSession } from "next-auth";
import { UserRound, History, LogOut, Heart, User } from "lucide-react";
import Navigation from "./Navigation";
import type { MenuItem } from "@/types/navigation.types";

// (ยังเก็บ util ไว้ได้ แต่โค้ดนี้ไม่ต้องใช้แล้ว)
// function hasRole(sessionRoles: string[] | undefined, target: string): boolean {
//   if (!sessionRoles?.length) return false;
//   const t = target.trim().toLowerCase();
//   return sessionRoles.some((r) => (r ?? "").toLowerCase() === t);
// }

const Navbar: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // user จาก NextAuth (อาจไม่มี id ระหว่างโหลด session)
  const rawUser = (session?.user ?? null) as (DefaultSession["user"] & {
    roles?: string[];
    id?: string;
  }) | null;

  // normalize user สำหรับเมนู
  const navUser = useMemo(() => {
    if (!rawUser || !rawUser.id) return null;
    return {
      id: rawUser.id,
      name: rawUser.name ?? "",
      email: rawUser.email ?? "",
      image: rawUser.image ?? undefined,
      roles: rawUser.roles ?? [],
    };
  }, [rawUser]);

  // ----- เมนูหลัก (แบบ Simple: แค่ล็อกอินก็เห็น Sitter Page) -----
  const menuItems: MenuItem[] = useMemo(() => {
    if (!navUser) {
      return [
        { href: "/auth/register", text: "Register" },
        { href: "/auth/login", text: "Login" },
      ];
    }

    const items: MenuItem[] = [
      { href: "/account/profile",  icon: UserRound, avatarIcon: UserRound, text: "Profile",         avatarText: "Profile" },
      { href: "/account/pet",      icon: Heart,     avatarIcon: Heart,     text: "Your Pet",        avatarText: "Your Pet" },
      { href: "/account/bookings", icon: History,   avatarIcon: History,   text: "Booking History", avatarText: "History" },

      //  โชว์เสมอเมื่อ login แล้ว (ไม่เช็ก role)
      { href: "/sitter/profile",   icon: User,      avatarIcon: User,      text: "Sitter Page",     avatarText: "Sitter Page" },

      // Logout
      { href: "#", icon: LogOut, avatarIcon: LogOut, text: "Logout", avatarText: "Log out", isLogout: true },
    ];

    return items;
  }, [navUser]);

  const handleNavigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch {
      window.location.href = "/";
    }
  }, []);

  return (
    <nav className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
        <div className="flex justify-between items-center h-12 py-3 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block hover:opacity-70 transition-opacity duration-200" aria-label="Go to landing page">
              <Image
                src="/icons/logo.svg"
                alt="Logo"
                width={131}
                height={100}
                className="h-6 md:h-10 w-auto object-contain cursor-pointer"
                priority
              />
            </Link>
          </div>

          <Navigation
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            user={navUser}
            menuItems={menuItems}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;