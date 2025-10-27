import React, { useMemo, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import type { DefaultSession } from "next-auth";
import { UserRound, History, LogOut, Heart, User } from "lucide-react";
import Navigation from "./Navigation";
import type { MenuItem } from "@/types/navigation.types";
import axios from "axios";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const rawUser = (session?.user ?? null) as (DefaultSession["user"] & {
    roles?: string[];
    id?: string;
  }) | null;

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

  // 1) เช็คจาก roles ก่อน
  const roleSaysSitter = useMemo(() => {
    const roles = navUser?.roles ?? [];
    return roles.some((r) => (r || "").toLowerCase().includes("sitter"));
  }, [navUser?.roles]);

  // 2) ถ้า roles ไม่ชัด ให้ถาม API (ไม่มี swr)
  const [dbSaysSitter, setDbSaysSitter] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!isAuthenticated) return setDbSaysSitter(false);
      try {
        const res = await axios.get("/api/user/is-sitter");
        const data = res.data;
        if (!cancelled) setDbSaysSitter(!!data?.isSitter);
      } catch {
        if (!cancelled) setDbSaysSitter(false);
      }
    }
    // เรียกเมื่อ login แล้ว หรือเปลี่ยน user id
    if (isAuthenticated) check();
    return () => { cancelled = true; };
  }, [isAuthenticated, navUser?.id]);

  const isSitter = roleSaysSitter || dbSaysSitter;

  const menuItems: MenuItem[] = useMemo(() => {
    if (!navUser) {
      return [
        { href: "/auth/register", text: "Register" },
        { href: "/auth/login", text: "Login" },
      ];
    }

    const sitterLabel = isSitter ? "Pet Sitter Profile" : "Become A Pet Sitter";

    return [
      { href: "/account/profile",  icon: UserRound, avatarIcon: UserRound, text: "Profile",         avatarText: "Profile" },
      { href: "/account/pet",      icon: Heart,     avatarIcon: Heart,     text: "Your Pet",        avatarText: "Your Pet" },
      { href: "/account/bookings", icon: History,   avatarIcon: History,   text: "Booking History", avatarText: "History" },
      { href: "/sitter/profile",   icon: User,      avatarIcon: User,      text: sitterLabel,       avatarText: sitterLabel },
      { href: "#", icon: LogOut, avatarIcon: LogOut, text: "Logout", avatarText: "Log out", isLogout: true },
    ];
  }, [navUser, isSitter]);

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