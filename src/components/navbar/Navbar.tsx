import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "./Navigation";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { UserRound, History, LogOut, Heart, User } from "lucide-react";
import { MenuItem } from "@/types/navigation.types";

const Navbar = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const getMenuItems = (): MenuItem[] => {
    if (!session?.user) {
      return [
        { href: "/register", text: "Register" },
        { href: "/auth/login", text: "Login" }
      ];
    }

    const menuItems: MenuItem[] = [
      {
        href: "/profile",
        icon: UserRound,
        avatarIcon: UserRound,
        text: "Profile",
        avatarText: "Profile"
      },
      {
        href: "/your-pet",
        icon: Heart,
        avatarIcon: Heart,
        text: "Your Pet",
        avatarText: "Your Pet"
      },
      {
        href: "/booking-history",
        icon: History,
        avatarIcon: History,
        text: "Booking History",
        avatarText: "History"
      }
    ];

    // Check roles directly from session
    if (session.user.roles?.includes('pet_sitter')) {
      menuItems.push({
        href: "/sitter-profile",
        icon: User,
        avatarIcon: User,
        text: "Sitter Profile",
        avatarText: "Sitter Profile"
      });
    }

    menuItems.push({
      href: "/logout",
      icon: LogOut,
      avatarIcon: LogOut,
      text: "Logout",
      avatarText: "Log out",
      isLogout: true
    });

    return menuItems;
  };

  const menuItems = getMenuItems();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      // Clear any local storage items if needed
      localStorage.removeItem('rememberedEmail');

      // Use a more direct approach - force full page redirect
      await signOut({
        callbackUrl: '/'
      });

      // Force a hard reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if signOut fails
      window.location.href = '/';
    }
  };

  return (
    <nav className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
        <div className="flex justify-between items-center h-12 py-3 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block hover:opacity-70 transition-opacity duration-200">
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

          {/* Navigation */}
          <Navigation
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            user={session?.user || null}
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