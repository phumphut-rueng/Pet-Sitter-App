import { UserRound, Bookmark, History, LogOut, Heart, User, LucideIcon } from "lucide-react";

export interface MenuItem {
  href: string;
  icon?: LucideIcon;
  avatarIcon?: LucideIcon;
  text: string;
  avatarText?: string;
  isLogout?: boolean;
}

export const getMenuItems = (isLoggedIn: boolean, isSitter: boolean): MenuItem[] => {
  if (isLoggedIn) {
    const loggedInItems: MenuItem[] = [
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
      },
    ];

    // Add sitter-specific menu item if user is a sitter
    if (isSitter) {
      loggedInItems.push({
        href: "/sitter-profile",
        icon: User,
        avatarIcon: User,
        text: "Sitter Profile",
        avatarText: "Sitter Profile"
      });
    }

    // Add logout with flag for separator
    loggedInItems.push({
      href: "/logout",
      icon: LogOut,
      avatarIcon: LogOut,
      text: "Logout",
      avatarText: "Log out",
      isLogout: true
    });

    return loggedInItems;
  } else {
    return [
      { href: "/register", text: "Register" },
      { href: "/login", text: "Login" }
    ];
  }
};