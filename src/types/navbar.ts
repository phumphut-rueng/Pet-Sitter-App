import { LucideIcon } from "lucide-react";

export interface User {
  id: number;
  name: string;
  email: string;
  profile_image?: string;
  roles?: string[];
  isSitter?: boolean;
}

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