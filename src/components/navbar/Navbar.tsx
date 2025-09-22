import React from "react";
import Image from "next/image";
import Navigation from "./Navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRound, History, LogOut, Heart, User } from "lucide-react";
import { MenuItem } from "@/types/navbar";

const Navbar = () => {
  const router = useRouter();
  const { state, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { user, loading = false } = state || {};
  const isLoading = Boolean(loading) || authLoading;

  const getMenuItems = (): MenuItem[] => {
    if (!user) {
      return [
        { href: "/register", text: "Register" },
        { href: "/login", text: "Login" }
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

    if (user?.isSitter === true || user?.roles?.includes('pet_sitter') === true) {
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

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
        <div className="flex justify-between items-center h-12 py-3 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/icons/logo.svg"
              alt="Logo"
              width={131}
              height={100}
              className="h-6 md:h-10 w-auto object-contain"
              priority
            />
          </div>

          {/* Navigation */}
          <Navigation
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            user={user}
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