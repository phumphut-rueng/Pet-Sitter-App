import { LucideIcon } from "lucide-react";
import { User } from "./user.types";

export interface MenuItem {
  href: string;
  text: string;
  icon?: LucideIcon;
  avatarIcon?: LucideIcon;
  avatarText?: string;
  isLogout?: boolean;
}

export interface NavigationProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  menuItems: MenuItem[];
  onNavigate: (path: string) => void;
  onLogout: () => void;
}